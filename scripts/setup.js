#!/usr/bin/env node

/**
 * PushPay Setup Script
 * Helps users configure their environment and get started
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

console.log('🚀 Welcome to PushPay Setup!\n');

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Generate a new wallet if needed
console.log('🔐 Wallet Setup:');
const wallet = ethers.Wallet.createRandom();
console.log(`   Address: ${wallet.address}`);
console.log(`   Private Key: ${wallet.privateKey}`);
console.log('   ⚠️  Save this private key securely!\n');

// Instructions
console.log('📝 Next Steps:');
console.log('1. Edit .env file with your credentials:');
console.log('   - Add the private key above to PUSH_CHAIN_PRIVATE_KEY');
console.log('   - Get Push Chain testnet tokens: https://faucet.push.org/');
console.log('   - Set up Twilio WhatsApp: https://console.twilio.com/');
console.log('');
console.log('2. Deploy smart contract:');
console.log('   npm run deploy');
console.log('');
console.log('3. Start the server:');
console.log('   npm run dev');
console.log('');
console.log('4. Test with WhatsApp:');
console.log('   Send "Hi" to your Twilio WhatsApp number');
console.log('');

// Create data directory
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}

console.log('🎉 Setup complete! Follow the steps above to get started.');
console.log('📚 For detailed instructions, see docs/SETUP.md');
console.log('');
console.log('💡 Need help? Check out:');
console.log('   - Push Chain Docs: https://pushchain.github.io/push-chain-website/');
console.log('   - Twilio WhatsApp: https://www.twilio.com/docs/whatsapp');
console.log('   - Project G.U.D: https://push.org/gud');