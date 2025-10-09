@echo off
echo Starting AutoBoy API Server for testing...

REM Start the server in background
start /B autoboy-backend.exe

REM Wait a few seconds for server to start
timeout /t 5 /nobreak > nul

REM Run the tests
autoboy-backend.exe test

REM Kill the server process
taskkill /f /im autoboy-backend.exe > nul 2>&1

echo Tests completed!
pause