# Windows Setup Guide

## 🔧 Fix PowerShell Execution Policy

You're getting "running scripts is disabled" because of PowerShell's execution policy.

### Option 1: Enable for Current User (Recommended)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 2: Bypass for Current Session

Open PowerShell (no admin needed) and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Then run your npm commands in that same window.

### Option 3: Use CMD Instead

Use Command Prompt (cmd.exe) instead of PowerShell:

```cmd
cd backend
npm install
npm run dev
```

## 🚀 Running the Application

### Backend (Terminal 1)

**Using CMD:**
```cmd
cd backend
npm install
npm run dev
```

**Using PowerShell (after fixing policy):**
```powershell
cd backend
npm install
npm run dev
```

### Frontend (Terminal 2)

**Using CMD:**
```cmd
cd frontend
npm install
npm start
```

**Using PowerShell (after fixing policy):**
```powershell
cd frontend
npm install
npm start
```

### Models (Build First)

**Using CMD:**
```cmd
cd models
npm install
npm run build
```

## 🐛 Troubleshooting

### "npm not found"
Install Node.js from https://nodejs.org/

### "Cannot find module"
Make sure to build models first:
```cmd
cd models
npm install
npm run build
```

### Port already in use
- Backend uses port 8080
- Frontend uses port 4200

Kill processes using these ports:
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### TypeScript errors
Make sure you're in the correct directory and dependencies are installed.

## ✅ Verification

After starting both servers:

1. Backend should show:
   ```
   🚀 WebSocket server started on port 8080
   ```

2. Frontend should open browser at:
   ```
   http://localhost:4200
   ```

3. Check browser console for WebSocket connection

## 🎮 Quick Test

1. Open http://localhost:4200
2. Enter your name
3. Click "Create Game"
4. You should see the lobby

If you see "Status: CONNECTED" - everything is working! 🎉

## 💡 Alternative: Use Git Bash

If you have Git installed, use Git Bash instead:

```bash
cd backend
npm install
npm run dev
```

Git Bash doesn't have PowerShell execution policy issues.

## 📝 Notes

- The execution policy is a Windows security feature
- It only affects PowerShell, not CMD
- RemoteSigned is safe for development
- You only need to set it once per user
