import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameListComponent } from './features/game-list/game-list.component';
import { LobbyComponent } from './features/lobby/lobby.component';
import { GameComponent } from './features/game/game.component';
import { TimerComponent } from './shared/components/timer/timer.component';
import { PlayerListComponent } from './shared/components/player-list/player-list.component';

@NgModule({
  declarations: [
    AppComponent,
    GameListComponent,
    LobbyComponent,
    GameComponent,
    TimerComponent,
    PlayerListComponent
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
