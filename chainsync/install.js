const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing ChainSync Universal Commerce Platform...\n');

try {
  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  
  // Install client dependencies
  console.log('\n📦 Installing client dependencies...');
  const clientDir = path.join(__dirname, 'client');
  execSync('npm install', { stdio: 'inherit', cwd: clientDir });
  
  // Create .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('\n📝 Creating .env file...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
    console.log('⚠️  Please edit .env with your configuration');
  }
  
  console.log('\n🎉 Installation completed successfully!');
  console.log('\n🚀 To start the development server:');
  console.log('   npm run dev');
  console.log('\n🌐 The app will be available at:');
  console.log('   Frontend: http://localhost:3001');
  console.log('   Backend:  http://localhost:3000');
  console.log('\n📚 Don\'t forget to:');
  console.log('   1. Edit .env with your Push Chain and Telegram bot details');
  console.log('   2. Make sure your PushPay bot is running');
  console.log('   3. Test the integration between ChainSync and your bot');
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}