@echo off
echo ========================================
echo Soul Shards - Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Checking git status...
git status --short
echo.

echo Current commits:
git log --oneline -n 3
echo.

echo ========================================
echo PUSH INSTRUCTIONS
echo ========================================
echo.
echo To push to GitHub, run this command:
echo git push -u origin main
echo.
echo When prompted for credentials:
echo - Username: water4699
echo - Password: [Your GitHub Personal Access Token]
echo.
echo If you don't have a Personal Access Token:
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Select "repo" scope
echo 4. Copy the token and use it as password
echo.
echo ========================================
echo.

pause
