/**
 * Simple logger utility
 */
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any): void {
    console.log(`[${this.formatTimestamp()}] INFO: ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[${this.formatTimestamp()}] ERROR: ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[${this.formatTimestamp()}] WARN: ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[${this.formatTimestamp()}] DEBUG: ${message}`, data || '');
    }
  }

  // Game lifecycle events
  static gameCreated(gameId: string, hostId: string): void {
    this.info(`Game created: ${gameId} by ${hostId}`);
  }

  static gameStarted(gameId: string, playerCount: number): void {
    this.info(`Game started: ${gameId} with ${playerCount} players`);
  }

  static gameEnded(gameId: string): void {
    this.info(`Game ended: ${gameId}`);
  }

  // Player events
  static playerJoined(gameId: string, playerId: string, playerName: string): void {
    this.info(`Player joined: ${playerName} (${playerId}) in game ${gameId}`);
  }

  static playerLeft(gameId: string, playerId: string): void {
    this.info(`Player left: ${playerId} from game ${gameId}`);
  }

  static playerDisconnected(playerId: string): void {
    this.warn(`Player disconnected: ${playerId}`);
  }

  // Phase transitions
  static phaseAdvanced(gameId: string, roomId: string, phase: string): void {
    this.info(`Phase advanced in game ${gameId}, room ${roomId} to ${phase}`);
  }

  // Connection events
  static connectionEstablished(connectionId: string): void {
    this.info(`Connection established: ${connectionId}`);
  }

  static connectionClosed(connectionId: string): void {
    this.info(`Connection closed: ${connectionId}`);
  }
}
