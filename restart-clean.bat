@echo off
echo ==========================================
echo   PGO Engine Dashboard - Clean Restart
echo ==========================================
echo.
echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo ✓ Node.js processes stopped
echo.
echo Waiting 3 seconds for cleanup...
timeout /t 3 /nobreak >nul
echo.
echo Starting Angular dev server with proxy...
echo ✓ Server will run on: http://localhost:4200
echo ✓ Proxy configured for API calls
echo.
ng serve --port 4200 --proxy-config proxy.conf.json
