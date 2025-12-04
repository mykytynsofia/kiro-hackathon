import { ConnectionManager } from './connection-manager';
import { HEARTBEAT_INTERVAL, HEARTBEAT_TIMEOUT } from '@monday-painter/models';

/**
 * Manages heartbeat ping-pong for WebSocket connections
 */
export class HeartbeatService {
  private interval: NodeJS.Timeout | null = null;

  constructor(private connectionManager: ConnectionManager) {}

  /**
   * Start heartbeat monitoring
   */
  start(): void {
    this.interval = setInterval(() => {
      this.checkConnections();
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat monitoring
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Check all connections and close stale ones
   */
  private checkConnections(): void {
    const now = Date.now();
    const connections = this.connectionManager.getAllConnections();

    for (const connection of connections) {
      // Send ping
      if (connection.ws.readyState === 1) { // OPEN
        connection.ws.ping();
      }

      // Check if connection is stale
      if (now - connection.lastHeartbeat > HEARTBEAT_TIMEOUT) {
        console.log(`Closing stale connection: ${connection.id}`);
        connection.ws.close();
        this.connectionManager.removeConnection(connection.id);
      }
    }
  }
}
