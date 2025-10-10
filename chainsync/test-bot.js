#!/usr/bin/env node

/**
 * Test Telegram Bot
 * This script tests if your bot is working correctly
 */

const https = require('https');

const BOT_TOKEN = '8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4';

console.log('🤖 Testing Telegram Bot...\n');

// Test 1: Get bot info
function getBotInfo() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log('✅ Bot Info:');
            console.log(`   Name: ${result.result.first_name}`);
            console.log(`   Username: @${result.result.username}`);
            console.log(`   ID: ${result.result.id}`);
            console.log(`   Can Join Groups: ${result.result.can_join_groups}`);
            console.log(`   Can Read Messages: ${result.result.can_read_all_group_messages}`);
            console.log(`   Supports Inline: ${result.result.supports_inline_queries}`);
            resolve(result.result);
          } else {
            console.error('❌ Failed to get bot info:', result.description);
            reject(new Error(result.description));
          }
        } catch (error) {
          console.error('❌ Error parsing bot info:', error.message);
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Test 2: Get webhook info
function getWebhookInfo() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log('\n📡 Webhook Info:');
            const info = result.result;
            console.log(`   URL: ${info.url || 'Not set'}`);
            console.log(`   Has Custom Certificate: ${info.has_custom_certificate}`);
            console.log(`   Pending Updates: ${info.pending_update_count}`);
            console.log(`   Last Error Date: ${info.last_error_date ? new Date(info.last_error_date * 1000) : 'None'}`);
            console.log(`   Last Error Message: ${info.last_error_message || 'None'}`);
            console.log(`   Max Connections: ${info.max_connections || 'Default'}`);
            resolve(info);
          } else {
            console.error('❌ Failed to get webhook info:', result.description);
            reject(new Error(result.description));
          }
        } catch (error) {
          console.error('❌ Error parsing webhook info:', error.message);
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Run tests
async function runTests() {
  try {
    await getBotInfo();
    await getWebhookInfo();
    
    console.log('\n🎉 Bot tests completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Deploy your app to Vercel');
    console.log('2. Run: node set-webhook.js https://your-vercel-url.vercel.app');
    console.log('3. Test by messaging @PushAuthBot');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();