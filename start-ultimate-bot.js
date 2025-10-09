require('dotenv').config();

// Kill any existing processes first
const { exec } = require('child_process');

console.log('🛑 Stopping any existing bot processes...');
exec('taskkill /f /im node.exe 2>nul', (error) => {
  // Ignore errors, just continue
  setTimeout(() => {
    console.log('🚀 Starting Ultimate PushPay Bot...\n');
    
    // Start the enhanced server
    require('./enhanced-server.js');
  }, 1000);
});