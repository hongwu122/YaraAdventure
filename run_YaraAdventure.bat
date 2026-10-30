@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Yara Adventure V8.3 2D Action Edition

set "BUILD_ID=v8.3-sanctum-20261007"
set "GAME_URL=http://127.0.0.1:8768/"

echo ============================================================
echo          Yara Adventure V8.3 - 2D Action Edition Launcher
echo ============================================================
echo Project folder:
echo %CD%
echo.

if not exist "server.py" goto MISSING_SERVER
if not exist "index.html" goto MISSING_INDEX
if not exist "game.js" goto MISSING_GAME

set "PY_CMD="
where py >nul 2>&1
if not errorlevel 1 (
  py -3 --version >nul 2>&1
  if not errorlevel 1 set "PY_CMD=py -3"
)
if defined PY_CMD goto PYTHON_OK
where python >nul 2>&1
if errorlevel 1 goto NO_PYTHON
python --version >nul 2>&1
if errorlevel 1 goto NO_PYTHON
set "PY_CMD=python"

:PYTHON_OK
echo Python command: %PY_CMD%
echo Build: %BUILD_ID%
echo Save slots: saves\slots_v82.json
echo Backup: saves\slots_v82.backup.json
echo.

netstat -ano 2>nul | findstr ":8768" | findstr "LISTENING" >nul
if not errorlevel 1 goto CHECK_EXISTING_SERVER

echo Starting local save server...
echo URL: %GAME_URL%
echo IMPORTANT: Keep this window open while playing.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "$u='http://127.0.0.1:8768/'; for($i=0;$i -lt 48;$i++){ try { $r=Invoke-RestMethod -Uri ($u+'api/health') -TimeoutSec 1; if($r.ok -and $r.build -eq 'v8.3-sanctum-20261007'){ Start-Process $u; exit 0 } } catch {} ; Start-Sleep -Milliseconds 250 }; exit 1"
%PY_CMD% -u -X utf8 "%~dp0server.py"
set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo ============================================================
echo Server stopped. Exit code: %EXIT_CODE%
echo Read the error above. This window will stay open.
echo ============================================================
pause
exit /b %EXIT_CODE%

:CHECK_EXISTING_SERVER
echo Port 8768 is already in use. Checking the running server...
powershell -NoProfile -Command "try{$r=Invoke-RestMethod -Uri 'http://127.0.0.1:8768/api/health' -TimeoutSec 2;if($r.app -eq 'YaraAdventure' -and $r.version -eq '8.3' -and $r.build -eq 'v8.3-sanctum-20261007'){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
if errorlevel 1 goto PORT_CONFLICT
echo Matching Yara V8.3 server found. Opening game...
start "" "%GAME_URL%"
echo.
echo This CMD window can be closed because the matching server is already running.
pause
exit /b 0

:PORT_CONFLICT
echo ERROR: Port 8768 is occupied by another program or an older Yara build.
echo Close the old Yara CMD window or the program using port 8768, then run this BAT again.
echo Diagnostic command:
echo netstat -ano ^| findstr :8768
pause
exit /b 13
:MISSING_SERVER
echo ERROR: server.py was not found.
echo Put this BAT in the YaraAdventure_V8.3 project root folder.
pause
exit /b 10
:MISSING_INDEX
echo ERROR: index.html was not found. Extract the full ZIP again.
pause
exit /b 11
:MISSING_GAME
echo ERROR: game.js was not found. Extract the full ZIP again.
pause
exit /b 14
:NO_PYTHON
echo ERROR: Python 3 was not found.
echo Install Python 3 and enable Add Python to PATH, then run this BAT again.
pause
exit /b 12
