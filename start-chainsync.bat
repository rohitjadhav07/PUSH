@echo off
echo 🚀 Starting ChainSync Universal Commerce Platform...

echo 📡 Starting backend server...
cd chainsync
start "ChainSync Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo 🌐 Starting frontend client...
cd client
start "ChainSync Frontend" cmd /k "npm run dev"

echo ✅ ChainSync is running!
echo 📡 Backend: http://localhost:3000
echo 🌐 Frontend: http://localhost:3001
echo 🔍 Health check: http://localhost:3000/health

pause
