require('dotenv').config();
const express = require('express');
const { PushChainUniversalClient } = require('./src/pushchain-client');
const { UserManager } = require('./src/user-manager');
const { PaymentProcessor } = require('./src/payment-processor');
const EnhancedTelegramBot = require('./src/enhanced-telegram-bot');
const database = require('./src/database/database');

// Environment validation
function validateEnvironment() {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'PUSH_CHAIN_RPC_URL',
    'PUSH_CHAIN_PRIVATE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please check your .env file');
    process.exit(1);
  }
  
  console.log('🔧 Environment validation passed');
}

// Initialize application
async function initializeApp() {
  console.log('🚀 Starting PushPay Ultimate Bot...\n');
  
  // Validate environment
  validateEnvironment();
  
  // Initialize database
  try {
    await database.initialize();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
  
  // Initialize Push Chain client
  let pushClient;
  try {
    pushClient = new PushChainUniversalClient({
      rpcUrl: process.env.PUSH_CHAIN_RPC_URL,
      privateKey: process.env.PUSH_CHAIN_PRIVATE_KEY,
      contractAddress: process.env.CONTRACT_ADDRESS
    });
    console.log('✅ Push Chain client initialized');
  } catch (error) {
    console.warn('⚠️  Push Chain connection failed - using mock mode');
    console.warn(`Error: ${error.message}`);
    pushClient = null;
  }
  
  // Initialize managers (legacy compatibility)
  const userManager = new UserManager(pushClient);
  
  // Update pushClient with userManager reference
  if (pushClient) {
    pushClient.userManager = userManager;
  }
  
  const paymentProcessor = new PaymentProcessor(pushClient, userManager);
  
  console.log('✅ Managers initialized');
  
  // Initialize Enhanced Telegram bot
  const telegramBot = new EnhancedTelegramBot(
    process.env.TELEGRAM_BOT_TOKEN,
    pushClient
  );
  
  console.log('✅ Enhanced Telegram bot started');
  
  // Create Express server for health checks and webhooks
  const app = express();
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'PushPay Ultimate Bot',
      version: '3.0.0',
      network: 'Push Chain Donut Testnet',
      uptime: process.uptime(),
      telegram: 'Connected',
      database: 'SQLite',
      features: {
        payments: true,
        paymentRequests: true,
        splitPayments: true,
        recurringPayments: true,
        socialFeed: true,
        defiIntegration: true,
        merchantTools: true,
        priceAlerts: true,
        twoFactorAuth: true,
        qrCodes: true,
        analytics: true
      }
    });
  });
  
  // Analytics endpoint
  app.get('/analytics', async (req, res) => {
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();
      
      const analytics = await database.getAnalytics(startDate, endDate);
      
      res.json({
        service: 'PushPay Ultimate Bot',
        network: 'Push Chain Universal',
        period: '30 days',
        ...analytics,
        features: {
          payments: 'Active',
          payment_requests: 'Active',
          split_payments: 'Active',
          recurring_payments: 'Active',
          social_feed: 'Active',
          defi_integration: 'Active',
          merchant_tools: 'Active',
          price_alerts: 'Active',
          two_factor_auth: 'Active',
          qr_codes: 'Active'
        },
        telegram: {
          polling: true,
          enhanced_commands: true,
          natural_language: true,
          inline_keyboards: true,
          callback_queries: true
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // User statistics endpoint
  app.get('/stats/users', async (req, res) => {
    try {
      const db = await database.getDb();
      
      const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
      const activeUsers = await db.get(`
        SELECT COUNT(DISTINCT from_user_id) as count 
        FROM transactions 
        WHERE created_at >= datetime('now', '-7 days')
      `);
      const newUsers = await db.get(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= datetime('now', '-7 days')
      `);
      
      res.json({
        total_users: totalUsers.count,
        active_users_7d: activeUsers.count,
        new_users_7d: newUsers.count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Transaction statistics endpoint
  app.get('/stats/transactions', async (req, res) => {
    try {
      const db = await database.getDb();
      
      const totalTx = await db.get('SELECT COUNT(*) as count, SUM(amount) as volume FROM transactions WHERE status = "confirmed"');
      const recentTx = await db.get(`
        SELECT COUNT(*) as count, SUM(amount) as volume 
        FROM transactions 
        WHERE status = 'confirmed' AND created_at >= datetime('now', '-24 hours')
      `);
      
      res.json({
        total_transactions: totalTx.count,
        total_volume: totalTx.volume || 0,
        transactions_24h: recentTx.count,
        volume_24h: recentTx.volume || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Payment requests endpoint
  app.get('/stats/requests', async (req, res) => {
    try {
      const db = await database.getDb();
      
      const requests = await db.all(`
        SELECT status, COUNT(*) as count 
        FROM payment_requests 
        GROUP BY status
      `);
      
      const splits = await db.all(`
        SELECT status, COUNT(*) as count 
        FROM split_payments 
        GROUP BY status
      `);
      
      res.json({
        payment_requests: requests,
        split_payments: splits,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Test database endpoint
  app.get('/test/db', async (req, res) => {
    try {
      const db = await database.getDb();
      const result = await db.get('SELECT COUNT(*) as count FROM users');
      
      res.json({
        database: 'Connected',
        users_count: result.count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        database: 'Error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Admin endpoint to create test user
  app.post('/admin/create-test-user', async (req, res) => {
    try {
      const { telegramId, username, phoneNumber } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: 'telegramId is required' });
      }
      
      // Create wallet
      const wallet = await pushClient.createWallet();
      
      // Create user
      const userId = await database.createUser({
        telegramId: telegramId.toString(),
        username: username || `testuser_${Date.now()}`,
        phoneNumber: phoneNumber || null,
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        displayName: `Test User ${telegramId}`
      });
      
      res.json({
        success: true,
        userId,
        walletAddress: wallet.address,
        message: 'Test user created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Start HTTP server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n🌐 HTTP server running on port ${PORT}`);
    console.log('📊 Analytics available at /analytics');
    console.log('🔍 Health check at /health');
    console.log('👥 User stats at /stats/users');
    console.log('💸 Transaction stats at /stats/transactions');
    console.log('💳 Request stats at /stats/requests');
    
    if (pushClient && pushClient.connected) {
      console.log('🔗 Connected to Push Chain Donut Testnet');
    }
    
    console.log('\n🎉 PushPay Ultimate Bot is ready!');
    console.log('🚀 **ULTIMATE FEATURES ENABLED:**');
    console.log('   ✅ Natural language payments');
    console.log('   ✅ Payment requests & splitting');
    console.log('   ✅ QR code receipts');
    console.log('   ✅ Social payment feed');
    console.log('   ✅ DeFi integration');
    console.log('   ✅ Merchant tools');
    console.log('   ✅ Price alerts');
    console.log('   ✅ 2FA security');
    console.log('   ✅ Advanced analytics');
    console.log('   ✅ SQLite database');
    console.log('   ✅ Comprehensive API');
    
    console.log('\n💡 **Users can now:**');
    console.log('   - Send payments: "Send 5 PC to @username"');
    console.log('   - Request money: "Request 10 PC from +1234567890"');
    console.log('   - Split bills: "Split 20 PC between @user1 @user2"');
    console.log('   - Create invoices and payment links');
    console.log('   - Track DeFi positions and yields');
    console.log('   - Set price alerts and notifications');
    console.log('   - Use merchant tools for business');
    console.log('   - Enable 2FA for security');
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down PushPay Ultimate Bot...');
    await database.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down PushPay Ultimate Bot...');
    await database.close();
    process.exit(0);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // Ignore Telegram callback query timeout errors
  if (reason?.code === 'ETELEGRAM' && reason?.response?.body?.description?.includes('query is too old')) {
    console.log('⚠️ Ignored Telegram callback timeout (harmless)');
    return;
  }
  
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit for Telegram errors - just log them
  if (reason?.code === 'ETELEGRAM') {
    console.log('🔄 Continuing despite Telegram API error...');
    return;
  }
  
  process.exit(1);
});

// Start the application
initializeApp().catch(console.error);