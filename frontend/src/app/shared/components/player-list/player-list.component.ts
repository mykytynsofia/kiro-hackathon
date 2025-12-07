import { Component, Input } from '@angular/core';
import { Player, ConnectionStatus, DEFAULT_ICON } from '@monday-painter/models';

@Component({
  selector: 'app-player-list',
  template: `
    <div class="player-list">
      <h3>Players ({{ players.length }})</h3>
      <div class="players">
        <div *ngFor="let player of players" class="player-item">
          <span class="player-icon">{{ player.icon || defaultIcon }}</span>
          <span class="player-status" 
                [class.connected]="player.connectionStatus === ConnectionStatus.CONNECTED"
                [class.disconnected]="player.connectionStatus === ConnectionStatus.DISCONNECTED">
          </span>
          <span class="player-name">{{ player.displayName }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .player-list {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .players {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .player-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .player-status {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .player-status.connected {
      background: #10b981;
    }

    .player-status.disconnected {
      background: #ef4444;
    }

    .player-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .player-name {
      font-weight: 500;
      color: #374151;
    }
  `]
})
export class PlayerListComponent {
  @Input() players: Player[] = [];
  ConnectionStatus = ConnectionStatus;
  defaultIcon = DEFAULT_ICON;
}
