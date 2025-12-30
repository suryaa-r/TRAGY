@echo off
echo Starting TRAGY Fashion Store...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
echo Starting server on http://localhost:3000
echo.
echo Available pages:
echo - Homepage: http://localhost:3000
echo - Shop: http://localhost:3000/shop
echo - Product: http://localhost:3000/product/1
echo - Admin: http://localhost:3000/admin
echo.
echo Press Ctrl+C to stop the server
echo.

node server-with-db.js