import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { GameMessage } from '../models/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messagesSubject = new Subject<GameMessage>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');

  public messages$: Observable<GameMessage> = this.messagesSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private intentionalDisconnect = false;
  private currentRoomId: string | null = null;
  private currentPlayerName: string | null = null;

  connect(roomId: string, playerName: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    // Store connection params for reconnection
    this.currentRoomId = roomId;
    this.currentPlayerName = playerName;
    this.intentionalDisconnect = false;

    this.connectionStatusSubject.next('connecting');

    const wsUrl = 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatusSubject.next('connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Send join message
      this.send({
        type: 'join',
        roomId,
        playerName
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as GameMessage;
        this.messagesSubject.next(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionStatusSubject.next('disconnected');
      this.ws = null;

      // Only attempt reconnection if disconnect was not intentional
      if (!this.intentionalDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 8000);
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
          if (this.currentRoomId && this.currentPlayerName && !this.intentionalDisconnect) {
            this.connect(this.currentRoomId, this.currentPlayerName);
          }
        }, delay);
      }
    };
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.currentRoomId = null;
    this.currentPlayerName = null;
    this.reconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatusSubject.next('disconnected');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
