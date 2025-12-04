import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-timer',
  template: `
    <div class="timer" [class.warning]="timeRemaining <= 10">
      <div class="timer-circle">
        <span class="timer-text">{{ timeRemaining }}</span>
      </div>
    </div>
  `,
  styles: [`
    .timer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .timer-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .timer.warning .timer-circle {
      background: #fef3c7;
      animation: pulse 1s infinite;
    }

    .timer-text {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
    }

    .timer.warning .timer-text {
      color: #f59e0b;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 60;
  @Output() timeExpired = new EventEmitter<void>();

  timeRemaining: number = 0;
  private interval: any;

  ngOnInit(): void {
    this.timeRemaining = this.duration;
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private startTimer(): void {
    this.interval = setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        this.timeExpired.emit();
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
