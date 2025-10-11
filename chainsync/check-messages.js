#!/usr/bin/env node

/**
 * Check for recent messages to the bot
 */

const https = require('https');

const BOT_TOKEN = '8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4';

// Get updates with offset to see recent messages
function getUpdates(offset = 0) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&limit=10`;
    
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

// Send a test message to see if the bot can send messages
function sendTestMessage() {
  return new Promise((resolve, reject) => {
    // We'll send to a test chat - you can replace this with your chat ID
    const payload = JSON.stringify({
      chat_id: '@PushAuthBot', // This will fail but help us test the bot token
      text: 'Test message'
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

async function checkMessages() {
  try {
    console.log('🔍 Checking for recent messages...\n');
    
    // Check recent updates
    const updates = await getUpdates();
    
    if (updates.ok) {
      console.log(`📨 Found ${updates.result.length} recent updates:`);
      
      if (updates.result.length === 0) {
        console.log('   No recent messages found.');
        console.log('   Try sending /start to @PushAuthBot now and run this script again.');
      } else {
        updates.result.forEach((update, index) => {
          console.log(`\n   Update ${index + 1} (ID: ${update.update_id}):`);
          if (update.message) {
            const msg = update.message;
            console.log(`     From: ${msg.from.first_name} (@${msg.from.username || 'no username'})`);
            console.log(`     Chat ID: ${msg.chat.id}`);
            console.log(`     Text: "${msg.text}"`);
            console.log(`     Date: ${new Date(msg.date * 1000)}`);
          } else if (update.callback_query) {
            console.log(`     Callback Query: ${update.callback_query.data}`);
          } else {
            console.log(`     Other update type: ${Object.keys(update).join(', ')}`);
          }
        });
      }
    } else {
      console.error('❌ Failed to get updates:', updates.description);
    }

    // Test if bot token works for sending
    console.log('\n🧪 Testing bot token...');
    try {
      const testResult = await sendTestMessage();
      if (testResult.ok) {
        console.log('✅ Bot token is valid and can send messages');
      } else {
        console.log(`⚠️ Bot token test result: ${testResult.description}`);
        if (testResult.description.includes('chat not found')) {
          console.log('   This is expected - the token works but chat ID is invalid');
        }
      }
    } catch (error) {
      console.error('❌ Bot token test failed:', error.message);
    }

    console.log('\n💡 Debugging suggestions:');
    console.log('1. If no messages found: Send /start to @PushAuthBot and run this again');
    console.log('2. If messages found but no response: Check Vercel function logs');
    console.log('3. If bot token fails: Verify the token with @BotFather');
    console.log('4. Check webhook endpoint: https://chainsync-social-commerce.vercel.app/api/telegram/webhook');

  } catch (error) {
    console.error('❌ Error checking messages:', error.message);
  }
}

checkMessages();