/**
 * Manages phase timers
 */
export class TimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Start a timer
   */
  startTimer(roomId: string, duration: number, callback: () => void): void {
    // Cancel existing timer if any
    this.cancelTimer(roomId);

    const timeout = setTimeout(() => {
      this.timers.delete(roomId);
      this.startTimes.delete(roomId);
      callback();
    }, duration * 1000);

    this.timers.set(roomId, timeout);
    this.startTimes.set(roomId, Date.now());
  }

  /**
   * Cancel a timer
   */
  cancelTimer(roomId: string): void {
    const timeout = this.timers.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.timers.delete(roomId);
      this.startTimes.delete(roomId);
    }
  }

  /**
   * Cancel all timers for a game
   */
  cancelAllTimers(gameId: string): void {
    // Note: In a real implementation, we'd need to track which timers belong to which game
    // For simplicity, we'll just provide a method to cancel by room ID
    for (const roomId of this.timers.keys()) {
      if (roomId.startsWith(gameId)) {
        this.cancelTimer(roomId);
      }
    }
  }

  /**
   * Get remaining time for a timer (in seconds)
   */
  getRemainingTime(roomId: string): number {
    const startTime = this.startTimes.get(roomId);
    if (!startTime) return 0;

    const elapsed = (Date.now() - startTime) / 1000;
    return Math.max(0, elapsed);
  }
}
