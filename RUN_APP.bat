@echo off
echo ========================================
echo Monday Painter - Setup and Run
echo ========================================
echo.

echo Step 1: Building Models...
cd models
call npm install
call npm run build
cd ..
echo Models built successfully!
echo.

echo Step 2: Installing Backend Dependencies...
cd backend
call npm install
cd ..
echo Backend dependencies installed!
echo.

echo Step 3: Installing Frontend Dependencies...
cd frontend
call npm install
cd ..
echo Frontend dependencies installed!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Open a new terminal and run:
echo    cd backend
echo    npm run dev
echo.
echo 2. Open another terminal and run:
echo    cd frontend
echo    npm start
echo.
echo 3. Open http://localhost:4200 in your browser
echo.
pause
