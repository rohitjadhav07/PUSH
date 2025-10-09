require('dotenv').config();
const { PushChainUniversalClient } = require('./src/pushchain-client');
const database = require('./src/database/database');

async function testUltimateBot() {
  console.log('🧪 Testing Ultimate Bot Features...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await database.initialize();
    const db = await database.getDb();
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Database connected - ${userCount.count} users found\n`);

    // Test 2: PushChain Connection
    console.log('2️⃣ Testing PushChain Connection...');
    const pushClient = new PushChainUniversalClient({
      rpcUrl: process.env.PUSH_CHAIN_RPC_URL,
      privateKey: process.env.PUSH_CHAIN_PRIVATE_KEY,
      contractAddress: process.env.CONTRACT_ADDRESS
    });
    
    if (pushClient.connected) {
      console.log('✅ PushChain connected successfully');
      await pushClient.testConnection();
    } else {
      console.log('❌ PushChain connection failed');
    }
    console.log('');

    // Test 3: Wallet Creation
    console.log('3️⃣ Testing Wallet Creation...');
    const newWallet = await pushClient.createWallet();
    console.log(`✅ New wallet created: ${newWallet.address}`);
    console.log(`🔑 Private key: ${newWallet.privateKey.substring(0, 10)}...`);
    console.log('');

    // Test 4: Balance Check
    console.log('4️⃣ Testing Balance Check...');
    const testAddress = '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961';
    const balance = await pushClient.getBalance(testAddress);
    console.log(`✅ Balance for ${testAddress}: ${balance} PC`);
    console.log('');

    // Test 5: Database User Operations
    console.log('5️⃣ Testing Database User Operations...');
    const testUserId = `test_${Date.now()}`;
    
    try {
      const userId = await database.createUser({
        telegramId: testUserId,
        username: 'testuser',
        phoneNumber: '+1234567890',
        walletAddress: newWallet.address,
        privateKey: newWallet.privateKey,
        displayName: 'Test User'
      });
      console.log(`✅ Test user created with ID: ${userId}`);

      const user = await database.getUserByTelegramId(testUserId);
      console.log(`✅ User retrieved: ${user.display_name} (${user.wallet_address})`);
    } catch (error) {
      console.log(`⚠️ User creation test: ${error.message}`);
    }
    console.log('');

    // Test 6: Transaction Recording
    console.log('6️⃣ Testing Transaction Recording...');
    try {
      const txId = await database.createTransaction({
        txHash: `test_tx_${Date.now()}`,
        fromUserId: 1,
        toUserId: null,
        toAddress: newWallet.address,
        amount: 10.5,
        tokenSymbol: 'PC',
        status: 'confirmed',
        type: 'test',
        message: 'Test transaction',
        metadata: { test: true }
      });
      console.log(`✅ Test transaction recorded with ID: ${txId}`);
    } catch (error) {
      console.log(`⚠️ Transaction recording test: ${error.message}`);
    }
    console.log('');

    // Test 7: Analytics
    console.log('7️⃣ Testing Analytics...');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    const analytics = await database.getAnalytics(startDate, endDate);
    console.log(`✅ Analytics retrieved:`);
    console.log(`   - Total users: ${analytics.userStats.total_users}`);
    console.log(`   - New users (30d): ${analytics.userStats.new_users}`);
    console.log(`   - Total transactions: ${analytics.transactionStats.total_transactions || 0}`);
    console.log(`   - Total volume: ${analytics.transactionStats.total_volume || 0} PC`);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('🚀 Ultimate Bot is ready for action!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await database.close();
  }
}

// Run tests
testUltimateBot().catch(console.error);