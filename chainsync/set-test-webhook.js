#!/usr/bin/env node

/**
 * Set test webhook for debugging
 */

const https = require('https');

const BOT_TOKEN = '8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4';
const WEBHOOK_URL = 'https://chainsync-social-commerce.vercel.app/api/telegram/test-webhook';

console.log('🧪 Setting test webhook...');
console.log('Webhook URL:', WEBHOOK_URL);

function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(WEBHOOK_URL)}`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.ok) {
          console.log('✅ Test webhook set successfully!');
          console.log('📍 Test Webhook URL:', WEBHOOK_URL);
          console.log('');
          console.log('🧪 Now send /start to @PushAuthBot to test');
          console.log('📋 Check Vercel function logs for debug output');
        } else {
          console.error('❌ Failed to set test webhook:', result.description);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error setting webhook:', err.message);
  });
}

setWebhook();