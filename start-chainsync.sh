#!/bin/bash
# ChainSync Startup Script

echo "🚀 Starting ChainSync Universal Commerce Platform..."

# Start backend server
echo "📡 Starting backend server..."
cd chainsync
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend client
echo "🌐 Starting frontend client..."
cd client
npm run dev &
FRONTEND_PID=$!

echo "✅ ChainSync is running!"
echo "📡 Backend: http://localhost:3000"
echo "🌐 Frontend: http://localhost:3001"
echo "🔍 Health check: http://localhost:3000/health"

# Wait for user input to stop
echo "Press Ctrl+C to stop all services..."
wait
