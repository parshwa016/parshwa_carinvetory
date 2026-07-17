@echo off
echo ========================================================
echo Starting Car Dealership Inventory System...
echo ========================================================
echo.
echo Launching Backend API (Port 5000)...
start "DriveSelect Backend Server" cmd /k "cd backend && npm run dev"

echo Launching Frontend SPA (Port 5173)...
start "DriveSelect Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Done! Both servers are starting in separate windows.
echo - Backend API: http://localhost:5000
echo - Frontend SPA: http://localhost:5173
echo ========================================================
pause
