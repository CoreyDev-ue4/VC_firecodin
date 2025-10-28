@echo off
setlocal ENABLEDELAYEDEXPANSION

set ROOT=%~dp0
set OFFLINE_HTML=%ROOT%offline\firefighter-arcade.html

if not exist "%OFFLINE_HTML%" (
  echo [Inferno Run] Offline preview missing. Please reinstall the project.
  exit /b 1
)

if exist node_modules goto :run_dev

echo [Inferno Run] Installing dependencies...
call npm install
if errorlevel 1 (
  echo [Inferno Run] Could not install npm packages. Launching offline preview instead.
  start "" "%OFFLINE_HTML%"
  exit /b 0
)

:run_dev
echo [Inferno Run] Starting development server at http://localhost:3000
npm run dev
