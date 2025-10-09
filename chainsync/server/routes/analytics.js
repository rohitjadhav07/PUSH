const express = require('express');
const router = express.Router();

// GET /api/analytics/overview - Get analytics overview
router.get('/overview', (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Mock analytics data
    const analytics = {
      users: {
        total: 1250,
        active: 890,
        new: 45
      },
      transactions: {
        total: 2340,
        volume: 125000,
        average: 53.4
      },
      products: {
        total: 156,
        sold: 89,
        revenue: 45600
      },
      chains: {
        ethereum: 45,
        solana: 32,
        polygon: 28,
        push: 67,
        base: 23
      },
      timeframe
    };
    
    res.json({
      success: true,
      data: analytics
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