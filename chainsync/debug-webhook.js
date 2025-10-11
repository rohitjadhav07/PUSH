#!/usr/bin/env node

/**
 * Debug Telegram Webhook
 * This script helps debug webhook issues
 */

const https = require('https');

const BOT_TOKEN = '8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4';

console.log('🔍 Debugging Telegram Bot Webhook...\n');

// Get webhook info
function getWebhookInfo() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Get updates (to see if messages are being received)
function getUpdates() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Send a test message to a chat (you'll need to provide a chat ID)
function sendTestMessage(chatId, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function debugBot() {
  try {
    console.log('📡 Checking webhook status...');
    const webhookInfo = await getWebhookInfo();
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log('✅ Webhook Info:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Pending Updates: ${info.pending_update_count}`);
      console.log(`   Max Connections: ${info.max_connections}`);
      console.log(`   Last Error Date: ${info.last_error_date ? new Date(info.last_error_date * 1000) : 'None'}`);
      console.log(`   Last Error Message: ${info.last_error_message || 'None'}`);
      
      if (info.last_error_message) {
        console.log('\n❌ Webhook Error Detected:');
        console.log(`   Error: ${info.last_error_message}`);
        console.log(`   Time: ${new Date(info.last_error_date * 1000)}`);
        console.log('\n💡 Common solutions:');
        console.log('   - Check if your Vercel app is deployed and accessible');
        console.log('   - Verify the webhook endpoint returns 200 OK');
        console.log('   - Check Vercel function logs for errors');
      }
    }

    console.log('\n📨 Checking for pending updates...');
    const updates = await getUpdates();
    
    if (updates.ok && updates.result.length > 0) {
      console.log(`✅ Found ${updates.result.length} pending updates:`);
      updates.result.forEach((update, index) => {
        console.log(`\n   Update ${index + 1}:`);
        if (update.message) {
          console.log(`     From: ${update.message.from.first_name} (@${update.message.from.username})`);
          console.log(`     Text: ${update.message.text}`);
          console.log(`     Date: ${new Date(update.message.date * 1000)}`);
        }
      });
      
      console.log('\n💡 These messages were not processed by your webhook!');
      console.log('   This suggests the webhook endpoint might not be working correctly.');
    } else {
      console.log('✅ No pending updates (webhook is processing messages correctly)');
    }

    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check Vercel deployment logs');
    console.log('2. Test webhook endpoint manually');
    console.log('3. Verify environment variables in Vercel');
    console.log('4. Check if bot token is correct');
    
    console.log('\n📋 Quick Tests:');
    console.log('- Send /start to @PushAuthBot');
    console.log('- Check Vercel function logs');
    console.log('- Run: node set-webhook.js delete (to remove webhook)');
    console.log('- Run: node set-webhook.js https://chainsync-social-commerce.vercel.app (to reset)');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugBot();