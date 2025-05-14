@echo off
echo Starting DittoBase Frontend...

cd frontend

REM Check if node_modules exists, if not install dependencies
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start the development server
echo Starting development server...
npm run dev

REM Keep the window open if there's an error
pause 