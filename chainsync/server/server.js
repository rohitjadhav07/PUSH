const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const socialRoutes = require('./routes/social');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', rateLimiterMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ChainSync Universal Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      universalCommerce: true,
      crossChainPayments: true,
      socialCommerce: true,
      pushChainIntegration: true,
      pushPayBotIntegration: true
    }
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);

// PushPay Bot Integration endpoint
app.get('/api/bot/info', (req, res) => {
  res.json({
    botUrl: process.env.TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot',
    features: [
      'Natural language payments',
      'Bill splitting',
      'Payment requests',
      'Real blockchain transactions',
      'Cross-chain support',
      'Social commerce integration'
    ],
    integration: {
      marketplace: 'Seamless integration with ChainSync marketplace',
      payments: 'Direct payment processing through Telegram',
      social: 'Social sharing and group payments'
    }
  });
});

// Project G.U.D specific endpoint
app.get('/api/gud/info', (req, res) => {
  res.json({
    project: 'ChainSync - Universal Social Commerce',
    competition: 'Project G.U.D',
    description: 'The first Universal Social Commerce platform built on Push Chain',
    features: {
      universalCommerce: 'Shop from any blockchain, pay with any token',
      socialCommerce: 'Share purchases, get social proof, viral growth',
      crossChainPayments: 'Seamless payments across all supported chains',
      pushPayBot: 'Integrated Telegram bot for instant payments'
    },
    chains: ['Push Chain', 'Ethereum', 'Solana', 'Polygon', 'Base', 'Arbitrum'],
    demo: {
      marketplace: '/marketplace',
      bot: process.env.TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot'
    },
    github: 'https://github.com/your-repo/chainsync',
    team: 'ChainSync Team'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
    availableEndpoints: [
      'GET /health',
      'GET /api/products',
      'GET /api/users',
      'GET /api/payments',
      'GET /api/social',
      'GET /api/analytics',
      'GET /api/bot/info',
      'GET /api/gud/info'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 ChainSync Universal Commerce API Server Started!

📊 Server Info:
   - Port: ${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3001'}

🌐 Available Endpoints:
   - Health Check: http://localhost:${PORT}/health
   - Products API: http://localhost:${PORT}/api/products
   - Users API: http://localhost:${PORT}/api/users
   - Payments API: http://localhost:${PORT}/api/payments
   - Social API: http://localhost:${PORT}/api/social
   - Analytics API: http://localhost:${PORT}/api/analytics
   - Bot Info: http://localhost:${PORT}/api/bot/info
   - G.U.D Info: http://localhost:${PORT}/api/gud/info

🤖 PushPay Bot Integration:
   - Bot URL: ${process.env.TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot'}
   - Features: Natural language payments, bill splitting, social commerce

🏆 Project G.U.D:
   - Universal Social Commerce Platform
   - Cross-chain payments and social features
   - Built on Push Chain for maximum interoperability

🎉 Ready to revolutionize commerce!
  `);
});

module.exports = app;