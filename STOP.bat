@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop_YaraAdventure.ps1"
set "STOP_EXIT=%ERRORLEVEL%"
echo.
pause
exit /b %STOP_EXIT%
