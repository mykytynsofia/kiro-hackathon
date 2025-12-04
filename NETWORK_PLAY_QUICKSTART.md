# 🌐 Network Play - Quick Start

## For the Host (Person Running the Game)

### Step 1: Start Everything
Double-click: **`START_NETWORK_GAME.bat`**

This will:
- Start the backend server
- Start the frontend server
- Show you the URL to share with friends

### Step 2: Configure Firewall

**Quick Method (Temporary):**
1. Search for "Windows Defender Firewall" in Start menu
2. Click "Turn Windows Defender Firewall on or off"
3. Turn OFF for "Private networks" only
4. ⚠️ Remember to turn it back ON after playing!

**Proper Method (Permanent):**
Open Command Prompt as Administrator and run:
```cmd
netsh advfirewall firewall add rule name="Monday Painter Frontend" dir=in action=allow protocol=TCP localport=4200
netsh advfirewall firewall add rule name="Monday Painter Backend" dir=in action=allow protocol=TCP localport=8080
```

### Step 3: Share the URL
The script will show something like:
```
Share this URL with other players:
http://192.168.1.100:4200
```

Send this URL to your friends!

## For Players (Joining the Game)

### Step 1: Get the URL
Ask the host for their URL (looks like `http://192.168.1.XXX:4200`)

### Step 2: Open in Browser
1. Open Chrome, Firefox, or Edge
2. Type the URL the host gave you
3. Enter your name
4. Join the game!

### Step 3: Make Sure You're on the Same Network
- Connect to the same WiFi as the host
- Or be on the same wired network

## Troubleshooting

### "Can't connect" or "Connection refused"
1. ✅ Check you're on the same WiFi/network
2. ✅ Check the host's firewall is configured
3. ✅ Check both backend and frontend are running on host
4. ✅ Try the URL in a different browser

### "WebSocket connection failed"
- The backend (port 8080) must also be accessible
- Check firewall allows port 8080
- The frontend automatically connects to the right WebSocket URL

### Need Your IP Address?
Run: **`GET_NETWORK_INFO.bat`**

## What You Need

- ✅ All players on same WiFi/LAN network
- ✅ Host computer running backend + frontend
- ✅ Firewall configured on host computer
- ✅ Modern web browser (Chrome, Firefox, Edge)

## Port Information

- **4200**: Frontend (Angular app)
- **8080**: Backend (WebSocket server)

Both must be accessible from the network for multiplayer to work.

---

**For detailed information, see [NETWORK_SETUP.md](NETWORK_SETUP.md)**
