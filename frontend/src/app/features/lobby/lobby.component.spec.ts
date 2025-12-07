import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LobbyComponent } from './lobby.component';
import { GameService } from '../../core/services/game.service';
import { AudioService } from '../../core/services/audio.service';
import { Game, GameState, PLAYER_ICONS, DEFAULT_ICON } from '@monday-painter/models';

describe('LobbyComponent - Mute Button Positioning', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let gameService: jasmine.SpyObj<GameService>;
  let audioService: jasmine.SpyObj<AudioService>;
  let router: jasmine.SpyObj<Router>;

  const mockGame: Game = {
    id: 'test-game',
    name: 'Test Game',
    hostId: 'player1',
    state: GameState.LOBBY,
    players: [
      { id: 'player1', displayName: 'Player 1', icon: '👶', isConnected: true },
      { id: 'player2', displayName: 'Player 2', icon: '👩', isConnected: true },
      { id: 'player3', displayName: 'Player 3', icon: '👨', isConnected: true }
    ],
    rooms: [],
    maxPlayers: 8,
    currentRound: 0
  };

  beforeEach(async () => {
    const gameServiceSpy = jasmine.createSpyObj('GameService', [
      'restoreGameState',
      'getCurrentPlayerId',
      'startGame',
      'leaveGame',
      'updatePlayerIcon'
    ]);
    const audioServiceSpy = jasmine.createSpyObj('AudioService', [
      'playLobbyMusic',
      'stopLobbyMusic',
      'toggleMute',
      'isMutedState'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    gameServiceSpy.game$ = of(mockGame);
    gameServiceSpy.getCurrentPlayerId.and.returnValue('player1');
    audioServiceSpy.isMutedState.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [LobbyComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: AudioService, useValue: audioServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    audioService = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Mute Button Rendering', () => {
    it('should render mute button', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      expect(muteBtn).toBeTruthy();
    });

    it('should display unmuted icon (🔊) when not muted', () => {
      audioService.isMutedState.and.returnValue(false);
      fixture.detectChanges();
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      expect(muteBtn.textContent.trim()).toBe('🔊');
    });

    it('should display muted icon (🔇) when muted', () => {
      audioService.isMutedState.and.returnValue(true);
      fixture.detectChanges();
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      expect(muteBtn.textContent.trim()).toBe('🔇');
    });

    it('should have correct title attribute when unmuted', () => {
      audioService.isMutedState.and.returnValue(false);
      fixture.detectChanges();
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      expect(muteBtn.getAttribute('title')).toBe('Mute');
    });

    it('should have correct title attribute when muted', () => {
      audioService.isMutedState.and.returnValue(true);
      fixture.detectChanges();
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      expect(muteBtn.getAttribute('title')).toBe('Unmute');
    });
  });

  describe('Mute Button Positioning', () => {
    it('should have position: fixed CSS', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.position).toBe('fixed');
    });

    it('should be positioned at bottom: 20px', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.bottom).toBe('20px');
    });

    it('should be positioned at right: 20px', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.right).toBe('20px');
    });

    it('should have high z-index (1000)', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.zIndex).toBe('1000');
    });

    it('should be outside the .card container', () => {
      const card = fixture.nativeElement.querySelector('.card');
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      
      // Mute button should not be a descendant of card
      expect(card.contains(muteBtn)).toBe(false);
    });

    it('should be inside the .container', () => {
      const container = fixture.nativeElement.querySelector('.container');
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      
      // Mute button should be a descendant of container
      expect(container.contains(muteBtn)).toBe(true);
    });
  });

  describe('Mute Button Styling', () => {
    it('should be circular (border-radius: 50%)', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.borderRadius).toBe('50%');
    });

    it('should have width of 50px', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.width).toBe('50px');
    });

    it('should have height of 50px', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.height).toBe('50px');
    });

    it('should have cursor: pointer', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const styles = window.getComputedStyle(muteBtn);
      expect(styles.cursor).toBe('pointer');
    });
  });

  describe('Mute Button Functionality', () => {
    it('should call toggleMute when clicked', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      muteBtn.click();
      
      expect(audioService.toggleMute).toHaveBeenCalled();
    });

    it('should resume lobby music when unmuting', () => {
      audioService.toggleMute.and.returnValue(false); // Returns false = unmuted
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      muteBtn.click();
      
      expect(audioService.toggleMute).toHaveBeenCalled();
      expect(audioService.playLobbyMusic).toHaveBeenCalled();
    });

    it('should not resume lobby music when muting', () => {
      audioService.toggleMute.and.returnValue(true); // Returns true = muted
      audioService.playLobbyMusic.calls.reset();
      
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      muteBtn.click();
      
      expect(audioService.toggleMute).toHaveBeenCalled();
      expect(audioService.playLobbyMusic).not.toHaveBeenCalled();
    });
  });

  describe('Visual Test Output', () => {
    it('should log mute button position for manual verification', () => {
      const muteBtn = fixture.nativeElement.querySelector('.mute-btn');
      const rect = muteBtn.getBoundingClientRect();
      const styles = window.getComputedStyle(muteBtn);
      
      console.log('=== MUTE BUTTON POSITION TEST ===');
      console.log('Position:', styles.position);
      console.log('Bottom:', styles.bottom);
      console.log('Right:', styles.right);
      console.log('Z-Index:', styles.zIndex);
      console.log('Width:', styles.width);
      console.log('Height:', styles.height);
      console.log('Border Radius:', styles.borderRadius);
      console.log('Bounding Rect:', {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      console.log('================================');
      
      // This test always passes but logs info for debugging
      expect(true).toBe(true);
    });
  });
});
