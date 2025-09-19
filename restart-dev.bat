@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
echo.
echo Starting Angular dev server with proxy...
ng serve --port 4200 --proxy-config proxy.conf.json
pause
