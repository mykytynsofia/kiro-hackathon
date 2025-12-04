# 🔥 Windows Firewall Setup for Monday Painter

## Why Do I Need This?

Windows Firewall blocks incoming connections by default. To let other players connect to your game, you need to allow connections on ports 4200 and 8080.

## Method 1: Quick Setup (Temporary)

**Best for:** One-time play sessions

### Steps:
1. Press `Windows Key` and search for **"Windows Defender Firewall"**
2. Click **"Turn Windows Defender Firewall on or off"** (left sidebar)
3. Under **"Private network settings"**, select **"Turn off Windows Defender Firewall"**
4. Click **OK**
5. ⚠️ **IMPORTANT**: Turn it back ON after you're done playing!

### Pros:
- ✅ Quick and easy
- ✅ No command line needed

### Cons:
- ❌ Less secure (firewall is completely off)
- ❌ Must remember to turn it back on
- ❌ Need to do this every time you play

---

## Method 2: Proper Setup (Permanent)

**Best for:** Regular play sessions

### Steps:

1. **Open Command Prompt as Administrator**
   - Press `Windows Key`
   - Type `cmd`
   - Right-click "Command Prompt"
   - Select "Run as administrator"

2. **Add Firewall Rules**
   
   Copy and paste these commands one at a time:

   ```cmd
   netsh advfirewall firewall add rule name="Monday Painter Frontend" dir=in action=allow protocol=TCP localport=4200
   ```

   Then:

   ```cmd
   netsh advfirewall firewall add rule name="Monday Painter Backend" dir=in action=allow protocol=TCP localport=8080
   ```

3. **Verify Rules Were Added**
   - Press `Windows Key` and search for **"Windows Defender Firewall with Advanced Security"**
   - Click **"Inbound Rules"** (left sidebar)
   - Look for "Monday Painter Frontend" and "Monday Painter Backend"
   - Both should show as **Enabled**

### Pros:
- ✅ More secure (only specific ports are open)
- ✅ Permanent (set it once, works forever)
- ✅ Firewall stays on for other protection

### Cons:
- ❌ Requires administrator access
- ❌ Slightly more complex

---

## Method 3: Manual Firewall Rule Creation

**Best for:** People who prefer GUI over command line

### Steps:

1. Press `Windows Key` and search for **"Windows Defender Firewall with Advanced Security"**
2. Click **"Inbound Rules"** (left sidebar)
3. Click **"New Rule..."** (right sidebar)

### For Frontend (Port 4200):
1. Select **"Port"** → Next
2. Select **"TCP"** and enter **"4200"** → Next
3. Select **"Allow the connection"** → Next
4. Check all boxes (Domain, Private, Public) → Next
5. Name: **"Monday Painter Frontend"** → Finish

### For Backend (Port 8080):
1. Click **"New Rule..."** again
2. Select **"Port"** → Next
3. Select **"TCP"** and enter **"8080"** → Next
4. Select **"Allow the connection"** → Next
5. Check all boxes (Domain, Private, Public) → Next
6. Name: **"Monday Painter Backend"** → Finish

---

## Removing Firewall Rules (Cleanup)

If you want to remove the rules later:

### Command Line Method:
```cmd
netsh advfirewall firewall delete rule name="Monday Painter Frontend"
netsh advfirewall firewall delete rule name="Monday Painter Backend"
```

### GUI Method:
1. Open **"Windows Defender Firewall with Advanced Security"**
2. Click **"Inbound Rules"**
3. Find "Monday Painter Frontend" and "Monday Painter Backend"
4. Right-click each → **Delete**

---

## Testing the Firewall

After configuring the firewall:

1. Start the game servers: `START_NETWORK_GAME.bat`
2. On another device (phone/laptop), try accessing: `http://[YOUR-IP]:4200`
3. If it works, firewall is configured correctly! ✅
4. If it doesn't work, check:
   - Both devices are on same network
   - Firewall rules are enabled
   - Backend and frontend are running

---

## Security Notes

- ✅ These rules only allow **incoming** connections
- ✅ Only ports 4200 and 8080 are opened
- ✅ Rules work for local network only (not internet)
- ✅ Your computer is still protected by firewall for everything else

---

## Common Issues

### "Access Denied" when running commands
- You need to run Command Prompt as **Administrator**
- Right-click → "Run as administrator"

### Rules added but still can't connect
- Check both backend and frontend are running
- Verify you're using the correct IP address
- Make sure both devices are on the same WiFi network
- Try restarting the servers

### Firewall keeps blocking even with rules
- Some antivirus software has additional firewalls
- Check your antivirus settings (Norton, McAfee, etc.)
- Temporarily disable antivirus to test

---

**Need help?** See [NETWORK_SETUP.md](NETWORK_SETUP.md) for more troubleshooting tips.
