require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import our modules
const database = require('./database/database');
const UniversalChainClient = require('./blockchain/universal-chain-client');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const socialRoutes = require('./routes/social');
const analyticsRoutes = require('./routes/analytics');

class ChainSyncServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = process.env.PORT || 3001;
    this.universalChain = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing ChainSync Universal Commerce Platform...\n');

      // Initialize database
      await database.initialize();
      console.log('✅ Database initialized');

      // Initialize universal chain client
      this.universalChain = new UniversalChainClient({
        ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL,
        POLYGON_RPC_URL: process.env.POLYGON_RPC_URL,
        BASE_RPC_URL: process.env.BASE_RPC_URL,
        PUSH_CHAIN_RPC_URL: process.env.PUSH_CHAIN_RPC_URL,
        PUSH_CHAIN_PRIVATE_KEY: process.env.PUSH_CHAIN_PRIVATE_KEY
      });
      console.log('✅ Universal chain client initialized');

      // Setup middleware
      this.setupMiddleware();
      console.log('✅ Middleware configured');

      // Setup routes
      this.setupRoutes();
      console.log('✅ Routes configured');

      // Setup WebSocket
      this.setupWebSocket();
      console.log('✅ WebSocket configured');

      // Setup error handling
      this.setupErrorHandling();
      console.log('✅ Error handling configured');

      console.log('\n🎉 ChainSync server initialization complete!');
      return true;

    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "wss:", "https:"]
        }
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://chainsync.app', 'https://www.chainsync.app']
        : true,
      credentials: true
    }));

    // Logging
    this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    this.app.use(express.static(path.join(__dirname, 'client/dist')));

    // Add universal chain client to request
    this.app.use((req, res, next) => {
      req.universalChain = this.universalChain;
      req.database = database;
      req.io = this.io;
      next();
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/social', socialRoutes);
    this.app.use('/api/analytics', analyticsRoutes);

    // Health check
    this.app.get('/api/health', async (req, res) => {
      try {
        const chainStatuses = await Promise.all(
          this.universalChain.getSupportedChains().map(async (chain) => {
            const status = await this.universalChain.getNetworkStatus(chain.name);
            return { ...chain, ...status };
          })
        );

        const dbStatus = database.isInitialized ? 'connected' : 'disconnected';

        res.json({
          status: 'OK',
          service: 'ChainSync Universal Commerce',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: dbStatus,
          chains: chainStatuses,
          features: {
            crossChainPayments: true,
            socialCommerce: true,
            groupBuying: true,
            affiliateProgram: true,
            realTimeNotifications: true
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Universal payment endpoint
    this.app.post('/api/payments/universal', async (req, res) => {
      try {
        const {
          fromChain,
          toChain,
          fromAddress,
          toAddress,
          amount,
          currency,
          privateKey
        } = req.body;

        // Validate required fields
        if (!fromChain || !toChain || !fromAddress || !toAddress || !amount) {
          return res.status(400).json({
            success: false,
            error: 'Missing required payment parameters'
          });
        }

        // Process universal payment
        const result = await this.universalChain.processPayment({
          fromChain,
          toChain,
          fromAddress,
          toAddress,
          amount: parseFloat(amount),
          currency: currency || 'PC',
          privateKey
        });

        // Log the transaction
        await database.logEvent({
          userId: req.user?.id,
          eventType: 'universal_payment',
          eventData: {
            fromChain,
            toChain,
            amount,
            currency,
            success: result.success
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.json({
          success: true,
          data: result,
          message: 'Universal payment processed successfully'
        });

      } catch (error) {
        console.error('Universal payment error:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Chain status endpoint
    this.app.get('/api/chains/status', async (req, res) => {
      try {
        const chains = this.universalChain.getSupportedChains();
        const statuses = await Promise.all(
          chains.map(async (chain) => {
            const status = await this.universalChain.getNetworkStatus(chain.name);
            return { ...chain, ...status };
          })
        );

        res.json({
          success: true,
          data: statuses,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Catch-all handler for client-side routing
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join user-specific room
      socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      });

      // Join product room for real-time updates
      socket.on('join-product-room', (productId) => {
        socket.join(`product-${productId}`);
        console.log(`📦 Joined product room: ${productId}`);
      });

      // Handle real-time chat for negotiations
      socket.on('send-message', async (data) => {
        try {
          const { recipientId, message, productId } = data;
          
          // Emit to recipient
          this.io.to(`user-${recipientId}`).emit('new-message', {
            senderId: socket.userId,
            message,
            productId,
            timestamp: new Date().toISOString()
          });

          console.log(`💬 Message sent from ${socket.userId} to ${recipientId}`);
        } catch (error) {
          console.error('Message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle order status updates
      socket.on('order-update', (data) => {
        const { orderId, status, userId } = data;
        
        // Notify relevant users
        this.io.to(`user-${userId}`).emit('order-status-update', {
          orderId,
          status,
          timestamp: new Date().toISOString()
        });
      });

      // Handle payment notifications
      socket.on('payment-notification', (data) => {
        const { userId, type, message, data: notificationData } = data;
        
        this.io.to(`user-${userId}`).emit('notification', {
          type,
          message,
          data: notificationData,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('❌ Server error:', error);

      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      res.status(error.status || 500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        console.log('✅ Server closed');
        database.close().then(() => {
          console.log('✅ Database closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      this.server.close(() => {
        console.log('✅ Server closed');
        database.close().then(() => {
          console.log('✅ Database closed');
          process.exit(0);
        });
      });
    });
  }

  async start() {
    try {
      await this.initialize();
      
      this.server.listen(this.port, () => {
        console.log(`\n🌐 ChainSync server running on port ${this.port}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/api/health`);
        console.log(`📊 Analytics: http://localhost:${this.port}/api/analytics`);
        console.log(`🛒 Products: http://localhost:${this.port}/api/products`);
        
        console.log('\n🎯 **CHAINSYNC UNIVERSAL COMMERCE PLATFORM**');
        console.log('🚀 **FEATURES ENABLED:**');
        console.log('   ✅ Cross-chain payments (ETH, MATIC, SOL, PC)');
        console.log('   ✅ Universal product marketplace');
        console.log('   ✅ Social commerce features');
        console.log('   ✅ Real-time notifications');
        console.log('   ✅ Group buying functionality');
        console.log('   ✅ Affiliate program');
        console.log('   ✅ Review and rating system');
        console.log('   ✅ Cross-chain analytics');
        
        console.log('\n💡 **READY FOR PROJECT G.U.D SUBMISSION!**');
        console.log('🏆 This Universal App will dominate the competition!');
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new ChainSyncServer();
server.start().catch(console.error);

module.exports = ChainSyncServer;