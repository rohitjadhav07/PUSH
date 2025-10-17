#!/usr/bin/env node

/**
 * Test Balance API
 * Tests if the balance API endpoint works correctly
 */

const https = require('https');

const TEST_TELEGRAM_ID = '123456789'; // Test user ID
const API_URL = 'https://chainsync-social-commerce.vercel.app';

console.log('🧪 Testing Balance API...\n');

function testBalanceAPI() {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}/api/wallet/balance/${TEST_TELEGRAM_ID}`;
    console.log('📡 Calling:', url);
    
    https.get(url, (res) => {
      let data = '';
      
      console.log('📥 Response status:', res.statusCode);
      console.log('📋 Response headers:', JSON.stringify(res.headers, null, 2));
      
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          console.log('\n📦 Raw response:', data);
          
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log('\n✅ Balance API Success!');
            console.log('   Balance:', result.data.balance, 'PC');
            console.log('   Address:', result.data.address);
            console.log('   Balance (wei):', result.data.balanceWei);
            resolve(result);
          } else {
            console.error('\n❌ API returned error:', result.error);
            reject(new Error(result.error));
          }
        } catch (error) {
          console.error('\n❌ Failed to parse response:', error.message);
          console.error('   Raw data:', data);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('\n❌ Request failed:', error.message);
      reject(error);
    });
  });
}

// Run test
async function runTest() {
  try {
    await testBalanceAPI();
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
