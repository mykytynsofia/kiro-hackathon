import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameListComponent } from './features/game-list/game-list.component';
import { LobbyComponent } from './features/lobby/lobby.component';
import { GameComponent } from './features/game/game.component';
import { InputPhaseComponent } from './features/game/input-phase/input-phase.component';
import { DrawPhaseComponent } from './features/game/draw-phase/draw-phase.component';
import { GuessPhaseComponent } from './features/game/guess-phase/guess-phase.component';
import { TransitionComponent } from './features/game/transition/transition.component';
import { TimerComponent } from './shared/components/timer/timer.component';
import { PlayerListComponent } from './shared/components/player-list/player-list.component';
import { CanvasComponent } from './shared/components/canvas/canvas.component';
import { ResultsComponent } from './features/results/results.component';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    LobbyComponent,
    GameComponent,
    InputPhaseComponent,
    DrawPhaseComponent,
    GuessPhaseComponent,
    TransitionComponent,
    TimerComponent,
    PlayerListComponent,
    CanvasComponent,
    ResultsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
