import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player, Guess, Scoreboard } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private scoresSubject = new BehaviorSubject<Scoreboard>({});
  private currentPromptSubject = new BehaviorSubject<string | null>(null);
  private guessesSubject = new BehaviorSubject<Guess[]>([]);
  private isDrawerSubject = new BehaviorSubject<boolean>(false);
  private roundNumberSubject = new BehaviorSubject<number>(0);
  private drawerIdSubject = new BehaviorSubject<string | null>(null);

  public players$: Observable<Player[]> = this.playersSubject.asObservable();
  public scores$: Observable<Scoreboard> = this.scoresSubject.asObservable();
  public currentPrompt$: Observable<string | null> = this.currentPromptSubject.asObservable();
  public guesses$: Observable<Guess[]> = this.guessesSubject.asObservable();
  public isDrawer$: Observable<boolean> = this.isDrawerSubject.asObservable();
  public roundNumber$: Observable<number> = this.roundNumberSubject.asObservable();
  public drawerId$: Observable<string | null> = this.drawerIdSubject.asObservable();

  updatePlayers(players: Player[]): void {
    this.playersSubject.next(players);
  }

  updateScores(scores: Scoreboard): void {
    this.scoresSubject.next(scores);
  }

  setPrompt(prompt: string | null): void {
    this.currentPromptSubject.next(prompt);
  }

  addGuess(guess: Guess): void {
    const currentGuesses = this.guessesSubject.value;
    this.guessesSubject.next([...currentGuesses, guess]);
  }

  clearGuesses(): void {
    this.guessesSubject.next([]);
  }

  setIsDrawer(isDrawer: boolean): void {
    this.isDrawerSubject.next(isDrawer);
  }

  setRoundNumber(roundNumber: number): void {
    this.roundNumberSubject.next(roundNumber);
  }

  setDrawerId(drawerId: string | null): void {
    this.drawerIdSubject.next(drawerId);
  }

  reset(): void {
    this.playersSubject.next([]);
    this.scoresSubject.next({});
    this.currentPromptSubject.next(null);
    this.guessesSubject.next([]);
    this.isDrawerSubject.next(false);
    this.roundNumberSubject.next(0);
    this.drawerIdSubject.next(null);
  }

  // Getters for current values
  get players(): Player[] {
    return this.playersSubject.value;
  }

  get scores(): Scoreboard {
    return this.scoresSubject.value;
  }

  get isDrawer(): boolean {
    return this.isDrawerSubject.value;
  }

  get currentPrompt(): string | null {
    return this.currentPromptSubject.value;
  }

  get guesses(): Guess[] {
    return this.guessesSubject.value;
  }
}
