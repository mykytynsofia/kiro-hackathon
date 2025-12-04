@echo off
echo ========================================
echo Monday Painter - Network Game Setup
echo ========================================
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
    goto :found
)

:found
REM Trim leading spaces
for /f "tokens=* delims= " %%a in ("%LOCAL_IP%") do set LOCAL_IP=%%a

echo Starting backend server...
start "Monday Painter Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Monday Painter Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo ========================================
echo Network Access
echo ========================================
echo.
echo Share this URL with other players:
echo.
echo    http://%LOCAL_IP%:4200
echo.
echo ========================================
echo.
echo IMPORTANT: Make sure Windows Firewall allows:
echo - Port 4200 (Frontend)
echo - Port 8080 (Backend)
echo.
echo See NETWORK_SETUP.md for firewall configuration
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
