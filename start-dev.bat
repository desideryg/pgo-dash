@echo off
echo Starting Angular app with CORS-disabled Chrome...
echo.
echo This will open Chrome with CORS disabled for development.
echo WARNING: Only use this for development, never for production!
echo.
start chrome.exe --user-data-dir="C:\temp\chrome-dev" --disable-web-security --disable-features=VizDisplayCompositor --allow-running-insecure-content --disable-extensions
echo.
echo Chrome opened with CORS disabled. Now starting Angular dev server...
echo.
npm start
