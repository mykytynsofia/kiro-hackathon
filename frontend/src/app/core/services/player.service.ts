import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '../../../../../models/src/types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  public player$ = this.currentPlayerSubject.asObservable();

  private readonly STORAGE_KEY = 'monday-painter-display-name';

  setDisplayName(name: string): void {
    localStorage.setItem(this.STORAGE_KEY, name);
  }

  getDisplayName(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  setCurrentPlayer(player: Player): void {
    this.currentPlayerSubject.next(player);
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  clearPlayer(): void {
    this.currentPlayerSubject.next(null);
  }
}
