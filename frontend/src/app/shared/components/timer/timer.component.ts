import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-timer',
  template: `
    <div class="timer-container">
      <div class="timer-bar">
        <div class="timer-fill" 
             [style.width.%]="progressPercentage"
             [class.warning]="getTimerClass() === 'warning'"
             [class.critical]="getTimerClass() === 'critical'">
        </div>
      </div>
      <div class="timer-text">
        <span class="time-remaining"
              [class.warning]="getTimerClass() === 'warning'"
              [class.critical]="getTimerClass() === 'critical'">
          {{ formatTime(timeRemaining) }}
        </span>
        <span class="time-total">/ {{ formatTime(totalDuration) }}</span>
      </div>
    </div>
  `,
  styles: [`
    .timer-container {
      margin-bottom: 24px;
    }

    .timer-bar {
      width: 100%;
      height: 32px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .timer-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff00 0%, #00cc00 50%, #009900 100%);
      transition: width 0.3s linear;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      position: relative;
    }

    .timer-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.3) 100%
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    .timer-text {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 18px;
      font-weight: 600;
    }

    .time-remaining {
      color: #00ff00;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
      font-size: 24px;
    }

    .time-total {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
    }

    /* Warning state when time is running low */
    .timer-fill.warning {
      background: linear-gradient(90deg, #ffaa00 0%, #ff8800 50%, #ff6600 100%);
      box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
    }

    .time-remaining.warning {
      color: #ffaa00;
      text-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
    }

    /* Critical state when time is almost up */
    .timer-fill.critical {
      background: linear-gradient(90deg, #ff0000 0%, #cc0000 50%, #990000 100%);
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
      animation: pulse 0.5s infinite;
    }

    .time-remaining.critical {
      color: #ff0000;
      text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
      animation: pulse 0.5s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() phaseStartedAt: number = 0;
  @Input() phaseDuration: number = 60; // in seconds
  @Output() timeExpired = new EventEmitter<void>();
  
  timeRemaining: number = 0;
  totalDuration: number = 0;
  progressPercentage: number = 100;
  
  private intervalId: any;
  private hasExpired: boolean = false;
  private lastBeepSecond: number = -1;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.totalDuration = this.phaseDuration;
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startTimer(): void {
    // Calculate initial time remaining
    this.updateTimeRemaining();

    // Update every 100ms for smooth animation
    this.intervalId = setInterval(() => {
      this.updateTimeRemaining();
    }, 100);
  }

  private updateTimeRemaining(): void {
    const now = Date.now();
    const elapsed = (now - this.phaseStartedAt) / 1000; // Convert to seconds
    this.timeRemaining = Math.max(0, this.totalDuration - elapsed);
    
    // Calculate progress percentage (100% = full time, 0% = no time)
    this.progressPercentage = (this.timeRemaining / this.totalDuration) * 100;

    // Play countdown beeps for last 5 seconds
    const secondsRemaining = Math.ceil(this.timeRemaining);
    if (secondsRemaining <= 5 && secondsRemaining > 0 && secondsRemaining !== this.lastBeepSecond) {
      this.audioService.playCountdownBeep();
      this.lastBeepSecond = secondsRemaining;
    }

    // Emit event when time runs out (only once)
    if (this.timeRemaining <= 0 && !this.hasExpired) {
      this.hasExpired = true;
      this.timeExpired.emit();
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getTimerClass(): string {
    const percentage = this.progressPercentage;
    if (percentage <= 20) {
      return 'critical';
    } else if (percentage <= 40) {
      return 'warning';
    }
    return '';
  }
}
