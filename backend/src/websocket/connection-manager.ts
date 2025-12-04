import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from '../types';

/**
 * Manages WebSocket connections and player associations
 */
export class ConnectionManager {
  private connections: Map<string, Connection> = new Map();

  /**
   * Add a new WebSocket connection
   */
  addConnection(ws: WebSocket): Connection {
    const connection: Connection = {
      id: uuidv4(),
      ws,
      playerId: null,
      gameId: null,
      lastHeartbeat: Date.now()
    };

    this.connections.set(connection.id, connection);
    return connection;
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get connection by player ID
   */
  getConnectionByPlayerId(playerId: string): Connection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.playerId === playerId) {
        return connection;
      }
    }
    return undefined;
  }

  /**
   * Associate a connection with a player and game
   */
  associatePlayer(connectionId: string, playerId: string, gameId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.playerId = playerId;
      connection.gameId = gameId;
    }
  }

  /**
   * Get all connections
   */
  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Update last heartbeat timestamp
   */
  updateHeartbeat(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastHeartbeat = Date.now();
    }
  }
}
