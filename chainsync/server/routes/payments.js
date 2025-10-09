const express = require('express');
const router = express.Router();

// Mock payments database
let payments = [
  {
    id: 1,
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    from: '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
    to: '0x59930b314519fA1fe5529aa188C391F1ccd84640',
    amount: 0.5,
    currency: 'ETH',
    usdValue: 900,
    productId: 1,
    status: 'confirmed',
    chain: 'ethereum',
    gasUsed: 21000,
    gasFee: 0.002,
    createdAt: '2024-01-20T10:30:00Z',
    confirmedAt: '2024-01-20T10:31:00Z'
  },
  {
    id: 2,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    from: '0x59930b314519fA1fe5529aa188C391F1ccd84640',
    to: '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
    amount: 2.5,
    currency: 'PC',
    usdValue: 50,
    productId: 2,
    status: 'confirmed',
    chain: 'push',
    gasUsed: 15000,
    gasFee: 0.001,
    createdAt: '2024-01-19T14:15:00Z',
    confirmedAt: '2024-01-19T14:16:00Z'
  }
];

// GET /api/payments - Get all payments
router.get('/', (req, res) => {
  try {
    const { 
      address, 
      status, 
      chain, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let filteredPayments = [...payments];
    
    // Filter by address (sender or receiver)
    if (address) {
      filteredPayments = filteredPayments.filter(p => 
        p.from.toLowerCase() === address.toLowerCase() || 
        p.to.toLowerCase() === address.toLowerCase()
      );
    }
    
    // Filter by status
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }
    
    // Filter by chain
    if (chain) {
      filteredPayments = filteredPayments.filter(p => p.chain === chain);
    }
    
    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredPayments.length / parseInt(limit)),
        totalItems: filteredPayments.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /api/payments/:txHash - Get payment by transaction hash
router.get('/:txHash', (req, res) => {
  try {
    const { txHash } = req.params;
    const payment = payments.find(p => p.txHash.toLowerCase() === txHash.toLowerCase());
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment Not Found',
        message: 'Payment with this transaction hash does not exist'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /api/payments - Create new payment
router.post('/', (req, res) => {
  try {
    const {
      from,
      to,
      amount,
      currency,
      productId,
      chain
    } = req.body;
    
    if (!from || !to || !amount || !currency || !chain) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Missing required fields: from, to, amount, currency, chain'
      });
    }
    
    // Generate mock transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 40);
    
    // Mock USD conversion rates
    const usdRates = {
      ETH: 1800,
      SOL: 20,
      MATIC: 1.2,
      PC: 20
    };
    
    const newPayment = {
      id: payments.length + 1,
      txHash,
      from,
      to,
      amount: parseFloat(amount),
      currency,
      usdValue: parseFloat(amount) * (usdRates[currency] || 1),
      productId: productId || null,
      status: 'pending',
      chain,
      gasUsed: null,
      gasFee: null,
      createdAt: new Date().toISOString(),
      confirmedAt: null
    };
    
    payments.push(newPayment);
    
    // Simulate confirmation after 2 seconds
    setTimeout(() => {
      const paymentIndex = payments.findIndex(p => p.id === newPayment.id);
      if (paymentIndex !== -1) {
        payments[paymentIndex].status = 'confirmed';
        payments[paymentIndex].confirmedAt = new Date().toISOString();
        payments[paymentIndex].gasUsed = Math.floor(Math.random() * 50000) + 21000;
        payments[paymentIndex].gasFee = Math.random() * 0.01;
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      data: newPayment,
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /api/payments/bot-integration - Handle PushPay Bot payments
router.post('/bot-integration', (req, res) => {
  try {
    const {
      telegramUserId,
      command,
      amount,
      recipient,
      productId
    } = req.body;
    
    // This endpoint would integrate with the PushPay bot
    // For now, return integration info
    res.json({
      success: true,
      message: 'Bot integration endpoint',
      data: {
        botUrl: process.env.TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot',
        supportedCommands: [
          'Send X PC to @username',
          'Request X PC from @username',
          'Split X PC between @user1 @user2',
          '/balance',
          '/faucet',
          '/history'
        ],
        integration: {
          telegramUserId,
          command,
          amount,
          recipient,
          productId,
          status: 'ready_for_processing'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /api/payments/stats/overview - Get payment statistics
router.get('/stats/overview', (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const filteredPayments = payments.filter(p => 
      new Date(p.createdAt) >= startDate && p.status === 'confirmed'
    );
    
    const stats = {
      totalPayments: filteredPayments.length,
      totalVolume: filteredPayments.reduce((sum, p) => sum + p.usdValue, 0),
      averagePayment: filteredPayments.length > 0 
        ? filteredPayments.reduce((sum, p) => sum + p.usdValue, 0) / filteredPayments.length 
        : 0,
      chainBreakdown: {},
      currencyBreakdown: {},
      timeframe
    };
    
    // Chain breakdown
    filteredPayments.forEach(p => {
      stats.chainBreakdown[p.chain] = (stats.chainBreakdown[p.chain] || 0) + 1;
    });
    
    // Currency breakdown
    filteredPayments.forEach(p => {
      stats.currencyBreakdown[p.currency] = (stats.currencyBreakdown[p.currency] || 0) + p.amount;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;