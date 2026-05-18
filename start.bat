@echo off
title AI Email Agent Launcher
color 0B

echo.
echo  ==========================================
echo   AI Email Agent - Local Development
echo   LangGraph + Groq + FastAPI + React
echo  ==========================================
echo.

:: Check that GROQ_API_KEY has been set
if not exist "%~dp0backend\.env" (
    echo  [!] backend\.env not found!
    echo  [!] Run:  copy backend\.env.example backend\.env
    echo  [!] Then add your GROQ_API_KEY inside backend\.env
    echo.
    pause
    exit /b 1
)

findstr /C:"gsk_your_key_here" "%~dp0backend\.env" >nul 2>&1
if %errorlevel%==0 (
    echo  [!] You still have the placeholder GROQ_API_KEY in backend\.env
    echo  [!] Replace it with your real key from https://console.groq.com
    echo.
    pause
    exit /b 1
)

echo  [1/2] Starting Backend (FastAPI on http://localhost:8000)...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0backend" && pip install -r requirements.txt -q && echo. && echo  Backend ready: http://localhost:8000 && echo  API docs:     http://localhost:8000/docs && echo. && uvicorn app.api.main:app --reload --port 8000"

echo  Waiting 6 seconds for backend to initialise...
timeout /t 6 /nobreak > nul

echo  [2/2] Starting Frontend (Vite on http://localhost:5173)...
start "Frontend - Vite" cmd /k "cd /d "%~dp0frontend" && npm install && echo. && echo  Frontend ready: http://localhost:5173 && echo. && npm run dev"

echo.
echo  ==========================================
echo   Both servers starting in new windows.
echo.
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Frontend: http://localhost:5173
echo  ==========================================
echo.
echo  Press any key to close this window.
echo  (The server windows will keep running.)
pause > nul
