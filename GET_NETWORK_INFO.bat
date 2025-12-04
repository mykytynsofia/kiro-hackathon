@echo off
echo ========================================
echo Monday Painter - Network Information
echo ========================================
echo.
echo Your Local IP Addresses:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo %%a
)

echo.
echo ========================================
echo Connection Instructions:
echo ========================================
echo.
echo 1. Make sure both backend and frontend are running
echo    - Backend: http://localhost:8080
echo    - Frontend: http://localhost:4200
echo.
echo 2. Other players on the same network can connect using:
echo    - Frontend: http://[YOUR-IP]:4200
echo    - Example: http://192.168.1.100:4200
echo.
echo 3. Make sure Windows Firewall allows connections on:
echo    - Port 4200 (Frontend)
echo    - Port 8080 (Backend WebSocket)
echo.
echo ========================================
echo.
pause
