#!/usr/bin/env node

/**
 * Telegram Webhook Setup for ChainSync
 * Run this after deploying your app to set up webhooks
 * 
 * Usage: node set-webhook.js [your-vercel-url]
 */

const https = require('https');

const BOT_TOKEN = '8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4';

// Get URL from command line argument or prompt for it
const args = process.argv.slice(2);
let WEBHOOK_URL;

if (args.length > 0) {
  WEBHOOK_URL = `${args[0]}/api/telegram/webhook`;
} else {
  console.log('❌ Please provide your Vercel URL as an argument');
  console.log('Usage: node set-webhook.js https://your-app.vercel.app');
  console.log('');
  console.log('Example: node set-webhook.js https://chainsync-social-commerce.vercel.app');
  process.exit(1);
}

console.log('🤖 Setting up Telegram webhook...');
console.log('Bot Token:', BOT_TOKEN.substring(0, 10) + '...');
console.log('Webhook URL:', WEBHOOK_URL);
console.log('');

function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(WEBHOOK_URL)}`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.ok) {
          console.log('✅ Webhook set successfully!');
          console.log('📍 Webhook URL:', WEBHOOK_URL);
          console.log('📝 Description:', result.description || 'Webhook is set');
          console.log('');
          console.log('🎉 Your bot is now ready to receive messages!');
          console.log('Test it by sending /start to @PushAuthBot');
        } else {
          console.error('❌ Failed to set webhook:', result.description);
          console.log('');
          console.log('💡 Common issues:');
          console.log('- Make sure your Vercel app is deployed and accessible');
          console.log('- Verify the URL is correct and uses HTTPS');
          console.log('- Check that /api/telegram/webhook endpoint exists');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error setting webhook:', err.message);
  });
}

// Also provide a function to delete webhook (useful for testing)
function deleteWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log('✅ Webhook deleted successfully!');
      } else {
        console.error('❌ Failed to delete webhook:', result.description);
      }
    });
  });
}

// Check if user wants to delete webhook
if (args[0] === 'delete') {
  console.log('🗑️ Deleting webhook...');
  deleteWebhook();
} else {
  setWebhook();
}