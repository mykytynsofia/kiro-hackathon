import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private isMuted = false;
  private lobbyMusic: HTMLAudioElement | null = null;
  private drawingMusic: HTMLAudioElement | null = null;
  private countdownBeep: HTMLAudioElement | null = null;
  private gameEndSound: HTMLAudioElement | null = null;

  constructor() {
    // Preload audio files
    if (typeof window !== 'undefined') {
      this.lobbyMusic = new Audio('assets/sounds/lobby-music.wav');
      this.lobbyMusic.loop = true;
      this.lobbyMusic.volume = 0.4;

      this.drawingMusic = new Audio('assets/sounds/drawing-music.wav');
      this.drawingMusic.loop = true;
      this.drawingMusic.volume = 0.5;

      this.countdownBeep = new Audio('assets/sounds/countdown-beep.wav');
      this.countdownBeep.volume = 0.6;

      this.gameEndSound = new Audio('assets/sounds/game-end.wav');
      this.gameEndSound.volume = 0.7;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAllMusic();
    }
    return this.isMuted;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  // Lobby ambient music (gentle, calming melody)
  playLobbyMusic(): void {
    if (this.isMuted || !this.lobbyMusic) return;
    
    this.lobbyMusic.currentTime = 0;
    this.lobbyMusic.play().catch(err => {
      console.warn('Failed to play lobby music:', err);
    });
  }

  stopLobbyMusic(): void {
    if (this.lobbyMusic) {
      this.lobbyMusic.pause();
      this.lobbyMusic.currentTime = 0;
    }
  }

  // Drawing phase music (upbeat, energetic melody)
  playDrawingMusic(): void {
    if (this.isMuted || !this.drawingMusic) return;
    
    this.drawingMusic.currentTime = 0;
    this.drawingMusic.play().catch(err => {
      console.warn('Failed to play drawing music:', err);
    });
  }

  stopDrawingMusic(): void {
    if (this.drawingMusic) {
      this.drawingMusic.pause();
      this.drawingMusic.currentTime = 0;
    }
  }

  stopAllMusic(): void {
    this.stopLobbyMusic();
    this.stopDrawingMusic();
  }

  // Countdown warning beep
  playCountdownBeep(): void {
    if (this.isMuted || !this.countdownBeep) return;
    
    // Clone the audio to allow overlapping beeps
    const beep = this.countdownBeep.cloneNode() as HTMLAudioElement;
    beep.volume = this.countdownBeep.volume;
    beep.play().catch(err => {
      console.warn('Failed to play countdown beep:', err);
    });
  }

  // Game ended victory sound
  playGameEndSound(): void {
    if (this.isMuted || !this.gameEndSound) return;
    
    this.gameEndSound.currentTime = 0;
    this.gameEndSound.play().catch(err => {
      console.warn('Failed to play game end sound:', err);
    });
  }
}
