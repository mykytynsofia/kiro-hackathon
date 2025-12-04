# Monday Painter - Demo Quick Start

## 🚀 Running the Demo

### 1. Install Dependencies

```bash
# Models
cd models
npm install
npm run build
cd ..

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

Server will start on `ws://localhost:8080`

### 3. Start Frontend (in new terminal)

```bash
cd frontend
npm start
```

Frontend will open at `http://localhost:4200`

## 🎮 Demo Flow

### What Works:
1. ✅ **Create Game** - Enter your name and create a game
2. ✅ **Lobby** - See players joining (simulated for demo)
3. ✅ **Start Game** - Host can start when 3+ players
4. ✅ **Game Phases** - UI for input/draw/guess phases
5. ✅ **WebSocket Connection** - Real-time communication

### What's Simulated:
- 🎨 **Canvas Drawing** - Placeholder (shows where canvas goes)
- 👥 **Multiple Players** - Single player demo (open multiple tabs to test)
- ⏱️ **Timer Auto-Submit** - Timer counts down but doesn't auto-submit yet

## 📝 Testing the Demo

### Single Player Test:
1. Open `http://localhost:4200`
2. Enter your name: "Alice"
3. Click "Create Game"
4. You'll see the lobby (need 3 players to start)

### Multi-Player Test:
1. Open 3 browser tabs
2. Tab 1: Create game as "Alice"
3. Tab 2: Join game as "Bob" (you'll need to implement join UI)
4. Tab 3: Join game as "Charlie"
5. Tab 1: Click "Start Game"
6. All tabs will navigate to game view

## 🔧 Current Limitations

### Backend:
- ✅ All core handlers implemented
- ✅ WebSocket server running
- ⚠️ No timer auto-submit yet
- ⚠️ No game list broadcast yet

### Frontend:
- ✅ Game creation flow
- ✅ Lobby with player list
- ✅ Game phase UI
- ⚠️ No actual canvas drawing (placeholder shown)
- ⚠️ No join game UI (only create)
- ⚠️ No results screen

## 🎯 What You Can Demo

**"Here's Monday Painter - a multiplayer drawing game like Gartic Phone"**

1. Show the landing page with game creation
2. Create a game and show the lobby
3. Explain: "Players would join here, and when we have 3+, the host starts"
4. Show the game phases:
   - Input phase: "Players write prompts"
   - Draw phase: "Players draw the prompt" (canvas placeholder)
   - Guess phase: "Players guess what was drawn"
5. Explain: "The game cycles through rooms, and at the end shows the funny evolution of prompts → drawings → guesses"

## 🚧 To Complete for Full Demo

### High Priority (2-3 hours):
1. **Canvas Component** - Actual HTML5 drawing
2. **Join Game UI** - Browse and join existing games
3. **Results Screen** - Show the chains at the end

### Medium Priority (1-2 hours):
4. **Timer Auto-Submit** - Auto-advance when time runs out
5. **Game List Updates** - Real-time game list
6. **Better Error Handling** - User-friendly error messages

### Low Priority:
7. **Styling Polish** - Better colors, animations
8. **Mobile Support** - Touch drawing
9. **Sound Effects** - Fun audio feedback

## 💡 Demo Tips

- **Emphasize the architecture**: "We have a clean separation - shared models, backend game logic, and Angular frontend"
- **Show the code structure**: "Everything is typed with TypeScript, validated, and follows the spec"
- **Highlight what's done**: "The core game flow is implemented - we just need to add the canvas drawing"
- **Be honest about placeholders**: "The canvas is a placeholder - that's the next piece to implement"

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure models are built: `cd models && npm run build`
- Check port 8080 is available

**Frontend won't start:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 4200 is available

**WebSocket won't connect:**
- Check backend is running
- Check browser console for errors
- Verify `environment.ts` has correct WebSocket URL

## 📚 Next Steps

After the demo, prioritize:
1. Implement CanvasComponent with actual drawing
2. Add game list/join functionality
3. Implement results screen
4. Add timer auto-submit logic

The foundation is solid - these are just UI components following the same patterns!
