# 🎨 Monday Painter

A multiplayer drawing and guessing game inspired by Gartic Phone and Telephone. Players take turns writing prompts, drawing them, and guessing what others drew, creating hilarious chains of miscommunication!

## 🚀 Quick Start

### Local Play (Single Computer)

1. **Start Backend**
   ```bash
   START_BACKEND.bat
   ```

2. **Start Frontend**
   ```bash
   START_FRONTEND.bat
   ```

3. **Open Browser**
   - Go to `http://localhost:4200`
   - Create a game and play!

### Network Play (Multiple Players)

Want to play with friends on the same WiFi/LAN?

**🚀 Super Quick Start:**
1. Double-click **`START_NETWORK_GAME.bat`**
2. Configure firewall (see [FIREWALL_SETUP.md](FIREWALL_SETUP.md))
3. Share the displayed URL with friends

**📚 Detailed Guides:**
- [NETWORK_PLAY_QUICKSTART.md](NETWORK_PLAY_QUICKSTART.md) - Step-by-step for host and players
- [FIREWALL_SETUP.md](FIREWALL_SETUP.md) - Windows Firewall configuration
- [NETWORK_SETUP.md](NETWORK_SETUP.md) - Complete technical documentation

## 🎮 How to Play

1. **Create/Join Game**: One player creates a game, others join
2. **Write Prompt**: Each player writes a creative prompt
3. **Draw**: Players rotate and draw the previous player's prompt
4. **Guess**: Players rotate and guess what the drawing represents
5. **Repeat**: Continue rotating through draw/guess phases
6. **Results**: See the hilarious evolution of each prompt chain!

## 📦 Project Structure

```
monday-painter/
├── models/          # Shared TypeScript models
├── backend/         # Node.js WebSocket server
├── frontend/        # Angular web application
├── START_BACKEND.bat
├── START_FRONTEND.bat
├── GET_NETWORK_INFO.bat
└── NETWORK_SETUP.md
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install models
cd models
npm install
npm run build

# Install backend
cd ../backend
npm install

# Install frontend
cd ../frontend
npm install
```

### Running

```bash
# Backend (from backend/)
npm run dev

# Frontend (from frontend/)
npm start
```

## 🌐 Network Configuration

The frontend is configured to:
- Bind to `0.0.0.0` (all network interfaces)
- Automatically connect WebSocket to the same host
- Support both localhost and network IP access

See [NETWORK_SETUP.md](NETWORK_SETUP.md) for firewall configuration and troubleshooting.

## 📝 Features

- ✅ Real-time multiplayer via WebSocket
- ✅ HTML5 canvas drawing with touch support
- ✅ Room rotation mechanics (like passing papers)
- ✅ Phase-based gameplay (Input → Draw → Guess)
- ✅ Results page showing complete chains
- ✅ Network play support
- ✅ Persistent game state (survives page refresh)

## 🔧 Technical Stack

- **Frontend**: Angular 17, TypeScript, RxJS
- **Backend**: Node.js, WebSocket (ws library)
- **Models**: Shared TypeScript package
- **Drawing**: HTML5 Canvas API

## 📄 License

MIT