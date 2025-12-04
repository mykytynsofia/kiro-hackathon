import { WebSocketServer } from 'ws';
import { ConnectionManager } from './websocket/connection-manager';
import { MessageRouter } from './websocket/message-router';
import { HeartbeatService } from './websocket/heartbeat';
import { GameManager } from './managers/game-manager';
import { PlayerManager } from './managers/player-manager';
import { RoomManager } from './managers/room-manager';
// import { TimerManager } from './managers/timer-manager'; // TODO: Use in handlers
import { BroadcastService } from './services/broadcast.service';
// import { StateSyncService } from './services/state-sync.service'; // TODO: Use in handlers
// import { ValidationService } from './services/validation.service'; // TODO: Use in handlers
import { handleCreateGame } from './handlers/create-game.handler';
import { handleJoinGame } from './handlers/join-game.handler';
import { handleStartGame } from './handlers/start-game.handler';
import { handleSubmitPrompt } from './handlers/submit-prompt.handler';
import { handleSubmitDrawing } from './handlers/submit-drawing.handler';
import { handleSubmitGuess } from './handlers/submit-guess.handler';
import { handleLeaveGame } from './handlers/leave-game.handler';
import { handleGetGameList } from './handlers/get-game-list.handler';
import { handleDisconnect } from './handlers/disconnect.handler';
import { Logger } from './utils/logger';
import { Metrics } from './utils/metrics';

const PORT = process.env.PORT || 8080;

// Initialize managers and services
const connectionManager = new ConnectionManager();
const gameManager = new GameManager();
const playerManager = new PlayerManager();
const roomManager = new RoomManager();
// const timerManager = new TimerManager(); // TODO: Use in handlers
const broadcastService = new BroadcastService(connectionManager);
// const stateSyncService = new StateSyncService(broadcastService, gameManager); // TODO: Use in handlers
// const validationService = new ValidationService(); // TODO: Use in handlers
const messageRouter = new MessageRouter();
const heartbeatService = new HeartbeatService(connectionManager);

// Register handlers
messageRouter.register('createGame', handleCreateGame);
messageRouter.register('joinGame', handleJoinGame);
messageRouter.register('startGame', handleStartGame);
messageRouter.register('submitPrompt', handleSubmitPrompt);
messageRouter.register('submitDrawing', handleSubmitDrawing);
messageRouter.register('submitGuess', handleSubmitGuess);
messageRouter.register('leaveGame', handleLeaveGame);
messageRouter.register('getGameList', handleGetGameList);

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT as number });

Logger.info(`🚀 WebSocket server started on port ${PORT}`);
Logger.info(`📊 Metrics will be printed every 60 seconds`);

// Start heartbeat
heartbeatService.start();

// Handle connections
wss.on('connection', (ws) => {
  const connection = connectionManager.addConnection(ws);
  Logger.connectionEstablished(connection.id);
  Metrics.incrementActivePlayers();

  // Handle messages
  ws.on('message', async (data) => {
    const startTime = Date.now();
    try {
      const message = JSON.parse(data.toString());
      
      const context = {
        connection,
        message,
        connectionManager,
        gameManager,
        playerManager,
        roomManager,
        broadcast: broadcastService
      };

      await messageRouter.route(context);
      
      const latency = Date.now() - startTime;
      Metrics.recordMessage(latency);
    } catch (error) {
      Logger.error('Message handling error', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: error instanceof Error ? error.message : 'Unknown error' }
      }));
    }
  });

  // Handle pong
  ws.on('pong', () => {
    connectionManager.updateHeartbeat(connection.id);
  });

  // Handle close
  ws.on('close', async () => {
    Logger.connectionClosed(connection.id);
    
    // Handle game-related cleanup before removing connection
    const context = {
      connection,
      message: { type: 'disconnect', payload: {} },
      connectionManager,
      gameManager,
      playerManager,
      roomManager,
      broadcast: broadcastService
    };
    
    await handleDisconnect(context);
    
    connectionManager.removeConnection(connection.id);
    Metrics.decrementActivePlayers();
  });

  // Handle errors
  ws.on('error', (error) => {
    Logger.error('WebSocket error', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, closing server...');
  heartbeatService.stop();
  wss.close(() => {
    Logger.info('Server closed');
    Metrics.printMetrics();
    process.exit(0);
  });
});

// Print metrics on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  Logger.info('SIGINT received, closing server...');
  heartbeatService.stop();
  wss.close(() => {
    Logger.info('Server closed');
    Metrics.printMetrics();
    process.exit(0);
  });
});
