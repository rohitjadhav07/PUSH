const express = require('express');
const router = express.Router();

// GET /api/analytics/overview - Get platform overview analytics
router.get('/overview', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const endDate = new Date();

    // Get analytics data
    const analytics = await req.database.getAnalytics(startDate.toISOString(), endDate.toISOString());

    // Get additional metrics
    const db = await req.database.getDb();
    
    // Cross-chain transaction stats
    const crossChainStats = await db.all(`
      SELECT 
        source_chain,
        destination_chain,
        COUNT(*) as transaction_count,
        SUM(amount) as total_volume
      FROM cross_chain_transactions
      WHERE created_at >= ?
      GROUP BY source_chain, destination_chain
      ORDER BY transaction_count DESC
    `, [startDate.toISOString()]);

    // Popular categories
    const categoryStats = await db.all(`
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(price_usd) as avg_price,
        SUM(views_count) as total_views
      FROM products
      WHERE status = 'active' AND created_at >= ?
      GROUP BY category
      ORDER BY product_count DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // Top sellers
    const topSellers = await db.all(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.seller_rating,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        COUNT(DISTINCT o.buyer_id) as unique_customers
      FROM users u
      JOIN orders o ON u.id = o.seller_id
      WHERE o.status IN ('paid', 'shipped', 'delivered') AND o.created_at >= ?
      GROUP BY u.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // Platform growth metrics
    const growthMetrics = await db.get(`
      SELECT 
        COUNT(DISTINCT DATE(created_at)) as active_days,
        COUNT(*) / COUNT(DISTINCT DATE(created_at)) as avg_daily_signups
      FROM users
      WHERE created_at >= ?
    `, [startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        timeframe,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        overview: analytics,
        crossChainTransactions: crossChainStats,
        popularCategories: categoryStats,
        topSellers,
        growthMetrics,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview'
    });
  }
});

// GET /api/analytics/chains - Get cross-chain analytics
router.get('/chains', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();

    // Chain usage statistics
    const chainUsage = await db.all(`
      SELECT 
        payment_chain as chain,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_volume,
        AVG(total_amount) as avg_transaction_size,
        COUNT(DISTINCT buyer_id) as unique_users
      FROM orders
      WHERE created_at >= ? AND status IN ('paid', 'shipped', 'delivered')
      GROUP BY payment_chain
      ORDER BY total_volume DESC
    `, [startDate.toISOString()]);

    // Cross-chain flow analysis
    const crossChainFlows = await db.all(`
      SELECT 
        source_chain,
        destination_chain,
        COUNT(*) as flow_count,
        SUM(amount) as flow_volume,
        AVG(amount) as avg_amount
      FROM cross_chain_transactions
      WHERE created_at >= ? AND status = 'confirmed'
      GROUP BY source_chain, destination_chain
      ORDER BY flow_volume DESC
    `, [startDate.toISOString()]);

    // Chain performance metrics
    const chainPerformance = await db.all(`
      SELECT 
        cct.source_chain as chain,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN cct.status = 'confirmed' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN cct.status = 'failed' THEN 1 END) as failed_transactions,
        AVG(
          CASE 
            WHEN cct.confirmed_at IS NOT NULL 
            THEN (julianday(cct.confirmed_at) - julianday(cct.created_at)) * 24 * 60 * 60 
          END
        ) as avg_confirmation_time_seconds
      FROM cross_chain_transactions cct
      WHERE cct.created_at >= ?
      GROUP BY cct.source_chain
    `, [startDate.toISOString()]);

    // User preferences by chain
    const userChainPreferences = await db.all(`
      SELECT 
        u.preferred_chain,
        COUNT(*) as user_count,
        AVG(u.total_purchases) as avg_purchases_per_user,
        AVG(u.total_sales) as avg_sales_per_user
      FROM users u
      WHERE u.created_at >= ?
      GROUP BY u.preferred_chain
      ORDER BY user_count DESC
    `, [startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        timeframe,
        chainUsage,
        crossChainFlows,
        chainPerformance,
        userChainPreferences,
        summary: {
          totalChains: chainUsage.length,
          totalCrossChainTransactions: crossChainFlows.reduce((sum, flow) => sum + flow.flow_count, 0),
          totalCrossChainVolume: crossChainFlows.reduce((sum, flow) => sum + parseFloat(flow.flow_volume), 0)
        }
      }
    });

  } catch (error) {
    console.error('Get chain analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chain analytics'
    });
  }
});

// GET /api/analytics/social - Get social commerce analytics
router.get('/social', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();

    // Social engagement metrics
    const socialEngagement = await db.get(`
      SELECT 
        COUNT(DISTINCT pl.user_id) as users_who_liked,
        COUNT(pl.id) as total_likes,
        COUNT(DISTINCT ss.user_id) as users_who_shared,
        COUNT(ss.id) as total_shares,
        COUNT(DISTINCT r.reviewer_id) as users_who_reviewed,
        COUNT(r.id) as total_reviews,
        AVG(r.rating) as avg_rating
      FROM product_likes pl
      FULL OUTER JOIN social_shares ss ON 1=1
      FULL OUTER JOIN reviews r ON 1=1
      WHERE pl.created_at >= ? OR ss.created_at >= ? OR r.created_at >= ?
    `, [startDate.toISOString(), startDate.toISOString(), startDate.toISOString()]);

    // Most engaging products
    const engagingProducts = await db.all(`
      SELECT 
        p.id,
        p.title,
        p.price_usd,
        p.category,
        u.username as seller_username,
        p.likes_count,
        p.shares_count,
        p.views_count,
        COUNT(r.id) as review_count,
        AVG(r.rating) as avg_rating,
        (p.likes_count + p.shares_count * 2 + p.views_count * 0.1) as engagement_score
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.created_at >= ?
      GROUP BY p.id
      ORDER BY engagement_score DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // Social influence metrics
    const socialInfluence = await db.all(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.followers_count,
        u.following_count,
        COUNT(DISTINCT ss.id) as shares_made,
        COUNT(DISTINCT pl.id) as likes_made,
        COUNT(DISTINCT r.id) as reviews_made,
        (u.followers_count * 0.1 + COUNT(DISTINCT ss.id) * 2 + COUNT(DISTINCT pl.id)) as influence_score
      FROM users u
      LEFT JOIN social_shares ss ON u.id = ss.user_id AND ss.created_at >= ?
      LEFT JOIN product_likes pl ON u.id = pl.user_id AND pl.created_at >= ?
      LEFT JOIN reviews r ON u.id = r.reviewer_id AND r.created_at >= ?
      WHERE u.followers_count > 0
      GROUP BY u.id
      ORDER BY influence_score DESC
      LIMIT 10
    `, [startDate.toISOString(), startDate.toISOString(), startDate.toISOString()]);

    // Viral content analysis
    const viralContent = await db.all(`
      SELECT 
        p.id,
        p.title,
        p.category,
        COUNT(ss.id) as share_count,
        COUNT(DISTINCT ss.platform) as platforms_shared_on,
        MIN(ss.created_at) as first_shared_at,
        MAX(ss.created_at) as last_shared_at
      FROM products p
      JOIN social_shares ss ON p.id = ss.product_id
      WHERE ss.created_at >= ?
      GROUP BY p.id
      HAVING share_count >= 5
      ORDER BY share_count DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        timeframe,
        socialEngagement,
        engagingProducts,
        socialInfluencers: socialInfluence,
        viralContent,
        summary: {
          totalSocialActions: (socialEngagement.total_likes || 0) + (socialEngagement.total_shares || 0) + (socialEngagement.total_reviews || 0),
          avgEngagementPerUser: socialEngagement.users_who_liked > 0 ? 
            ((socialEngagement.total_likes || 0) + (socialEngagement.total_shares || 0)) / socialEngagement.users_who_liked : 0
        }
      }
    });

  } catch (error) {
    console.error('Get social analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social analytics'
    });
  }
});

// GET /api/analytics/revenue - Get revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const { timeframe = '30d', currency = 'USD' } = req.query;
    
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();

    // Revenue by time period
    const revenueByDay = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT buyer_id) as unique_buyers
      FROM orders
      WHERE status IN ('paid', 'shipped', 'delivered') 
        AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate.toISOString()]);

    // Revenue by category
    const revenueByCategory = await db.all(`
      SELECT 
        p.category,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.buyer_id) as unique_buyers
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status IN ('paid', 'shipped', 'delivered') 
        AND o.created_at >= ?
      GROUP BY p.category
      ORDER BY revenue DESC
    `, [startDate.toISOString()]);

    // Revenue by payment chain
    const revenueByChain = await db.all(`
      SELECT 
        payment_chain,
        currency,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status IN ('paid', 'shipped', 'delivered') 
        AND created_at >= ?
      GROUP BY payment_chain, currency
      ORDER BY revenue DESC
    `, [startDate.toISOString()]);

    // Top revenue generating products
    const topProducts = await db.all(`
      SELECT 
        p.id,
        p.title,
        p.category,
        p.price_usd,
        u.username as seller_username,
        COUNT(o.id) as units_sold,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_sale_price
      FROM products p
      JOIN orders o ON p.id = o.product_id
      JOIN users u ON p.seller_id = u.id
      WHERE o.status IN ('paid', 'shipped', 'delivered') 
        AND o.created_at >= ?
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // Platform fees and commissions
    const platformFees = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as gross_revenue,
        SUM(total_amount * 0.025) as platform_fees,
        AVG(total_amount * 0.025) as avg_fee_per_transaction
      FROM orders
      WHERE status IN ('paid', 'shipped', 'delivered') 
        AND created_at >= ?
    `, [startDate.toISOString()]);

    // Calculate totals
    const totalRevenue = revenueByDay.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    const totalOrders = revenueByDay.reduce((sum, day) => sum + (day.order_count || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        timeframe,
        currency,
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders,
          avgOrderValue: avgOrderValue.toFixed(2),
          platformFees: platformFees.platform_fees?.toFixed(2) || '0.00'
        },
        revenueByDay,
        revenueByCategory,
        revenueByChain,
        topProducts,
        platformFees
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue analytics'
    });
  }
});

// GET /api/analytics/users - Get user analytics
router.get('/users', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();

    // User growth metrics
    const userGrowth = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN is_seller = 1 THEN 1 END) as new_sellers
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate.toISOString()]);

    // User activity metrics
    const userActivity = await db.get(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.last_active >= ? THEN u.id END) as active_users,
        COUNT(DISTINCT CASE WHEN o.buyer_id IS NOT NULL THEN o.buyer_id END) as buyers,
        COUNT(DISTINCT CASE WHEN o.seller_id IS NOT NULL THEN o.seller_id END) as sellers,
        AVG(u.total_purchases) as avg_purchases_per_user,
        AVG(u.total_sales) as avg_sales_per_user
      FROM users u
      LEFT JOIN orders o ON (u.id = o.buyer_id OR u.id = o.seller_id) 
        AND o.created_at >= ?
    `, [startDate.toISOString(), startDate.toISOString()]);

    // User segmentation by activity
    const userSegmentation = await db.all(`
      SELECT 
        CASE 
          WHEN total_purchases = 0 AND total_sales = 0 THEN 'Inactive'
          WHEN total_purchases > 0 AND total_sales = 0 THEN 'Buyer Only'
          WHEN total_purchases = 0 AND total_sales > 0 THEN 'Seller Only'
          WHEN total_purchases > 0 AND total_sales > 0 THEN 'Buyer & Seller'
        END as user_type,
        COUNT(*) as user_count,
        AVG(total_purchases) as avg_purchases,
        AVG(total_sales) as avg_sales
      FROM users
      WHERE created_at >= ?
      GROUP BY user_type
    `, [startDate.toISOString()]);

    // Geographic distribution (if available)
    const geographicDistribution = await db.all(`
      SELECT 
        'Unknown' as region,
        COUNT(*) as user_count
      FROM users
      WHERE created_at >= ?
      GROUP BY region
      ORDER BY user_count DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    // User retention analysis
    const retentionAnalysis = await db.all(`
      SELECT 
        DATE(u.created_at) as cohort_date,
        COUNT(DISTINCT u.id) as cohort_size,
        COUNT(DISTINCT CASE WHEN u.last_active >= ? THEN u.id END) as retained_users
      FROM users u
      WHERE u.created_at >= ?
      GROUP BY DATE(u.created_at)
      ORDER BY cohort_date ASC
    `, [startDate.toISOString(), startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        timeframe,
        userGrowth,
        userActivity,
        userSegmentation,
        geographicDistribution,
        retentionAnalysis,
        summary: {
          totalNewUsers: userGrowth.reduce((sum, day) => sum + (day.new_users || 0), 0),
          totalNewSellers: userGrowth.reduce((sum, day) => sum + (day.new_sellers || 0), 0),
          activeUserRate: userActivity.total_users > 0 ? 
            ((userActivity.active_users || 0) / userActivity.total_users * 100).toFixed(1) + '%' : '0%'
        }
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
});

// GET /api/analytics/realtime - Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const db = await req.database.getDb();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Real-time metrics
    const realtimeMetrics = await db.get(`
      SELECT 
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as orders_last_hour,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as orders_last_24h,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        SUM(CASE WHEN created_at >= ? THEN total_amount ELSE 0 END) as revenue_last_hour,
        SUM(CASE WHEN created_at >= ? THEN total_amount ELSE 0 END) as revenue_last_24h
      FROM orders
    `, [oneHourAgo.toISOString(), oneDayAgo.toISOString(), oneHourAgo.toISOString(), oneDayAgo.toISOString()]);

    // Active users (last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeUsers = await db.get(`
      SELECT COUNT(DISTINCT user_id) as active_users_5min
      FROM analytics_events
      WHERE created_at >= ?
    `, [fiveMinutesAgo.toISOString()]);

    // Recent transactions
    const recentTransactions = await db.all(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.currency,
        o.status,
        o.created_at,
        p.title as product_title,
        buyer.username as buyer_username,
        seller.username as seller_username
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // System health metrics
    const systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: now.toISOString()
    };

    res.json({
      success: true,
      data: {
        metrics: {
          ...realtimeMetrics,
          ...activeUsers
        },
        recentTransactions,
        systemHealth,
        lastUpdated: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Get realtime analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch realtime analytics'
    });
  }
});

module.exports = router;