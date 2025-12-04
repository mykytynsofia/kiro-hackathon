import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transition',
  template: `
    <div class="transition">
      <div class="spinner-large"></div>
      <h2>{{ message }}</h2>
      <p class="sub-message">{{ subMessage }}</p>
    </div>
  `,
  styles: [`
    .transition {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 40px 20px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      margin-bottom: 24px;
      border: 6px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    h2 {
      color: white;
      font-size: 28px;
      margin-bottom: 12px;
      text-align: center;
    }

    .sub-message {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      text-align: center;
      max-width: 400px;
    }
  `]
})
export class TransitionComponent {
  @Input() message: string = 'Please wait...';
  @Input() subMessage: string = 'Preparing next phase';
}
