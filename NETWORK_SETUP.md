# Monday Painter - Network Setup Guide

## Playing with Friends on the Same Network

This guide explains how to set up Monday Painter so multiple players on the same local network (WiFi/LAN) can play together.

## Quick Setup

### 1. Find Your Local IP Address

Run the helper script:
```bash
GET_NETWORK_INFO.bat
```

This will display your computer's local IP address (e.g., `192.168.1.100`).

### 2. Start the Backend Server

```bash
START_BACKEND.bat
```

The backend will run on port `8080`.

### 3. Start the Frontend

```bash
START_FRONTEND.bat
```

The frontend will run on port `4200` and be accessible from the network.

### 4. Configure Windows Firewall

You need to allow incoming connections on ports 4200 and 8080.

**Option A: Quick (Disable Firewall Temporarily)**
- Open Windows Defender Firewall
- Click "Turn Windows Defender Firewall on or off"
- Turn off for Private networks (only while playing)
- **Remember to turn it back on after playing!**

**Option B: Proper (Add Firewall Rules)**

Run these commands in Command Prompt as Administrator:

```cmd
netsh advfirewall firewall add rule name="Monday Painter Frontend" dir=in action=allow protocol=TCP localport=4200
netsh advfirewall firewall add rule name="Monday Painter Backend" dir=in action=allow protocol=TCP localport=8080
```

## Connecting Players

### Host Player (Your Computer)
- Open browser and go to: `http://localhost:4200`
- Create a new game

### Other Players (Same Network)
- Open browser and go to: `http://[HOST-IP]:4200`
- Example: `http://192.168.1.100:4200`
- Join the game created by the host

## Troubleshooting

### Players Can't Connect

1. **Check Firewall**: Make sure Windows Firewall allows connections on ports 4200 and 8080
2. **Check IP Address**: Verify you're using the correct local IP address
3. **Same Network**: Ensure all players are on the same WiFi/LAN network
4. **Backend Running**: Make sure the backend server is running on the host computer
5. **Port Conflicts**: Make sure no other applications are using ports 4200 or 8080

### Find Your IP Address Manually

1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. It will look like: `192.168.x.x` or `10.0.x.x`

### WebSocket Connection Issues

The frontend automatically connects to the WebSocket server on the same host:
- If you access via `http://localhost:4200`, it connects to `ws://localhost:8080`
- If you access via `http://192.168.1.100:4200`, it connects to `ws://192.168.1.100:8080`

This means the backend must be accessible from the network for remote players to connect.

## Network Architecture

```
Host Computer (192.168.1.100)
├── Backend (Port 8080)
│   └── WebSocket Server
└── Frontend (Port 4200)
    └── Angular App

Other Players
└── Browser → http://192.168.1.100:4200
    └── WebSocket → ws://192.168.1.100:8080
```

## Security Notes

- This setup is for **local network play only**
- Do not expose these ports to the internet without proper security
- The firewall rules only allow local network access
- Turn off firewall exceptions when not playing

## Testing the Setup

1. On host computer, open: `http://localhost:4200`
2. On another device, open: `http://[HOST-IP]:4200`
3. Both should see the same game list
4. Create a game on one device, it should appear on the other

## Common IP Address Ranges

- `192.168.x.x` - Most home routers
- `10.0.x.x` - Some home routers
- `172.16.x.x` to `172.31.x.x` - Less common

Your IP address should match one of these patterns for local network play.
