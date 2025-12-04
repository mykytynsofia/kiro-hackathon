/**
 * Simple metrics tracking
 */
export class Metrics {
  private static activeGames = 0;
  private static activePlayers = 0;
  private static totalMessagesProcessed = 0;
  private static messageLatencies: number[] = [];

  static incrementActiveGames(): void {
    this.activeGames++;
  }

  static decrementActiveGames(): void {
    this.activeGames = Math.max(0, this.activeGames - 1);
  }

  static incrementActivePlayers(): void {
    this.activePlayers++;
  }

  static decrementActivePlayers(): void {
    this.activePlayers = Math.max(0, this.activePlayers - 1);
  }

  static recordMessage(latencyMs: number): void {
    this.totalMessagesProcessed++;
    this.messageLatencies.push(latencyMs);
    
    // Keep only last 100 latencies
    if (this.messageLatencies.length > 100) {
      this.messageLatencies.shift();
    }
  }

  static getMetrics() {
    const avgLatency = this.messageLatencies.length > 0
      ? this.messageLatencies.reduce((a, b) => a + b, 0) / this.messageLatencies.length
      : 0;

    return {
      activeGames: this.activeGames,
      activePlayers: this.activePlayers,
      totalMessagesProcessed: this.totalMessagesProcessed,
      averageMessageLatency: avgLatency.toFixed(2) + 'ms'
    };
  }

  static printMetrics(): void {
    console.log('\n=== Server Metrics ===');
    console.log(`Active Games: ${this.activeGames}`);
    console.log(`Active Players: ${this.activePlayers}`);
    console.log(`Total Messages: ${this.totalMessagesProcessed}`);
    console.log(`Avg Latency: ${this.getMetrics().averageMessageLatency}`);
    console.log('=====================\n');
  }
}

// Print metrics every 60 seconds
setInterval(() => {
  Metrics.printMetrics();
}, 60000);
