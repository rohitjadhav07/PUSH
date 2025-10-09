const express = require('express');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  // In a real app, this would verify JWT token
  req.user = { id: 1, username: 'demo_user' };
  next();
};

// GET /api/users/search - Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const db = await req.database.getDb();
    let query = `
      SELECT 
        id, username, display_name, avatar_url, bio,
        is_verified, is_seller, seller_rating,
        followers_count, following_count, total_sales
      FROM users
      WHERE (username LIKE ? OR display_name LIKE ?)
    `;
    
    const params = [`%${q}%`, `%${q}%`];

    // Filter by user type
    if (type === 'sellers') {
      query += ' AND is_seller = 1';
    } else if (type === 'verified') {
      query += ' AND is_verified = 1';
    }

    query += ' ORDER BY followers_count DESC, total_sales DESC LIMIT ?';
    params.push(parseInt(limit));

    const users = await db.all(query, params);

    res.json({
      success: true,
      data: {
        users,
        query: q,
        type,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

// GET /api/users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const user = await req.database.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive information
    const { password_hash, ...publicUser } = user;

    // Parse JSON fields
    publicUser.social_links = JSON.parse(user.social_links || '{}');

    // Get user's products
    const products = await req.database.getProducts({ sellerId: userId }, 10, 0);

    // Get user's reviews (as a seller)
    const db = await req.database.getDb();
    const reviews = await db.all(`
      SELECT r.*, u.username as reviewer_username, u.display_name as reviewer_name,
             u.avatar_url as reviewer_avatar, p.title as product_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.reviewed_user_id = ? AND r.status = 'active'
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const followCheck = await db.get(`
        SELECT id FROM user_follows 
        WHERE follower_id = ? AND following_id = ?
      `, [req.user.id, userId]);
      isFollowing = !!followCheck;
    }

    // Get follower/following counts and recent activity
    const activityStats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM user_follows WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = ?) as following_count,
        (SELECT COUNT(*) FROM product_likes pl JOIN products p ON pl.product_id = p.id WHERE p.seller_id = ?) as total_likes_received,
        (SELECT COUNT(*) FROM social_shares ss JOIN products p ON ss.product_id = p.id WHERE p.seller_id = ?) as total_shares_received
    `, [userId, userId, userId, userId]);

    res.json({
      success: true,
      data: {
        user: {
          ...publicUser,
          ...activityStats,
          isFollowing
        },
        products,
        reviews,
        stats: {
          totalProducts: products.length,
          totalReviews: reviews.length,
          avgRating: reviews.length > 0 ? 
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// GET /api/users/:id/products - Get user's products
router.get('/:id/products', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { page = 1, limit = 20, status = 'active' } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = { 
      sellerId: userId,
      ...(status !== 'all' && { status })
    };
    
    const products = await req.database.getProducts(filters, parseInt(limit), offset);

    // Get total count
    const db = await req.database.getDb();
    const totalResult = await db.get(`
      SELECT COUNT(*) as total FROM products 
      WHERE seller_id = ? ${status !== 'all' ? 'AND status = ?' : ''}
    `, status !== 'all' ? [userId, status] : [userId]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult.total,
          pages: Math.ceil(totalResult.total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user products'
    });
  }
});

// GET /api/users/:id/reviews - Get reviews for user (as seller)
router.get('/:id/reviews', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { page = 1, limit = 20 } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const db = await req.database.getDb();
    const reviews = await db.all(`
      SELECT r.*, 
             u.username as reviewer_username, u.display_name as reviewer_name,
             u.avatar_url as reviewer_avatar,
             p.title as product_title, p.images as product_images
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.reviewed_user_id = ? AND r.status = 'active'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    // Parse JSON fields
    const parsedReviews = reviews.map(review => ({
      ...review,
      images: JSON.parse(review.images || '[]'),
      product_images: JSON.parse(review.product_images || '[]')
    }));

    // Get total count and rating stats
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE reviewed_user_id = ? AND status = 'active'
    `, [userId]);

    res.json({
      success: true,
      data: {
        reviews: parsedReviews,
        stats: {
          ...stats,
          avg_rating: parseFloat((stats.avg_rating || 0).toFixed(1))
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: stats.total_reviews,
          pages: Math.ceil(stats.total_reviews / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user reviews'
    });
  }
});

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { timeframe = '30d' } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();

    // Sales statistics
    const salesStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT buyer_id) as unique_customers,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
      FROM orders
      WHERE seller_id = ? AND created_at >= ?
    `, [userId, startDate.toISOString()]);

    // Product statistics
    const productStats = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        AVG(price_usd) as avg_product_price
      FROM products
      WHERE seller_id = ? AND created_at >= ?
    `, [userId, startDate.toISOString()]);

    // Social statistics
    const socialStats = await db.get(`
      SELECT 
        COUNT(DISTINCT uf1.follower_id) as followers_gained,
        COUNT(DISTINCT uf2.following_id) as users_followed,
        COUNT(DISTINCT pl.product_id) as products_liked,
        COUNT(DISTINCT ss.product_id) as products_shared
      FROM users u
      LEFT JOIN user_follows uf1 ON u.id = uf1.following_id AND uf1.created_at >= ?
      LEFT JOIN user_follows uf2 ON u.id = uf2.follower_id AND uf2.created_at >= ?
      LEFT JOIN product_likes pl ON u.id = pl.user_id AND pl.created_at >= ?
      LEFT JOIN social_shares ss ON u.id = ss.user_id AND ss.created_at >= ?
      WHERE u.id = ?
    `, [startDate.toISOString(), startDate.toISOString(), startDate.toISOString(), startDate.toISOString(), userId]);

    // Performance over time
    const performanceOverTime = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        COUNT(DISTINCT buyer_id) as unique_customers
      FROM orders
      WHERE seller_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId, startDate.toISOString()]);

    // Top performing products
    const topProducts = await db.all(`
      SELECT 
        p.id, p.title, p.price_usd,
        COUNT(o.id) as units_sold,
        SUM(o.total_amount) as revenue,
        p.views_count, p.likes_count
      FROM products p
      LEFT JOIN orders o ON p.id = o.product_id AND o.status IN ('paid', 'shipped', 'delivered')
      WHERE p.seller_id = ?
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      data: {
        timeframe,
        period: {
          start: startDate.toISOString(),
          end: new Date().toISOString()
        },
        salesStats: {
          ...salesStats,
          total_revenue: parseFloat((salesStats.total_revenue || 0).toFixed(2)),
          avg_order_value: parseFloat((salesStats.avg_order_value || 0).toFixed(2))
        },
        productStats: {
          ...productStats,
          avg_product_price: parseFloat((productStats.avg_product_price || 0).toFixed(2))
        },
        socialStats,
        performanceOverTime,
        topProducts
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

// GET /api/users/leaderboard - Get user leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'revenue', timeframe = '30d', limit = 20 } = req.query;
    
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();
    let query, params;

    switch (type) {
      case 'revenue':
        query = `
          SELECT 
            u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
            COUNT(o.id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_order_value
          FROM users u
          JOIN orders o ON u.id = o.seller_id
          WHERE o.status IN ('paid', 'shipped', 'delivered') AND o.created_at >= ?
          GROUP BY u.id
          ORDER BY total_revenue DESC
          LIMIT ?
        `;
        params = [startDate.toISOString(), parseInt(limit)];
        break;

      case 'sales':
        query = `
          SELECT 
            u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
            COUNT(o.id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            COUNT(DISTINCT o.buyer_id) as unique_customers
          FROM users u
          JOIN orders o ON u.id = o.seller_id
          WHERE o.status IN ('paid', 'shipped', 'delivered') AND o.created_at >= ?
          GROUP BY u.id
          ORDER BY total_orders DESC
          LIMIT ?
        `;
        params = [startDate.toISOString(), parseInt(limit)];
        break;

      case 'social':
        query = `
          SELECT 
            u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
            u.followers_count,
            COUNT(DISTINCT pl.product_id) as products_liked,
            COUNT(DISTINCT ss.product_id) as products_shared,
            (u.followers_count + COUNT(DISTINCT pl.product_id) * 2 + COUNT(DISTINCT ss.product_id) * 3) as social_score
          FROM users u
          LEFT JOIN product_likes pl ON u.id = pl.user_id AND pl.created_at >= ?
          LEFT JOIN social_shares ss ON u.id = ss.user_id AND ss.created_at >= ?
          GROUP BY u.id
          ORDER BY social_score DESC
          LIMIT ?
        `;
        params = [startDate.toISOString(), startDate.toISOString(), parseInt(limit)];
        break;

      case 'rating':
        query = `
          SELECT 
            u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
            u.seller_rating,
            COUNT(r.id) as total_reviews,
            AVG(r.rating) as avg_rating
          FROM users u
          LEFT JOIN reviews r ON u.id = r.reviewed_user_id AND r.created_at >= ?
          WHERE u.is_seller = 1 AND u.seller_rating > 0
          GROUP BY u.id
          HAVING total_reviews >= 3
          ORDER BY u.seller_rating DESC, total_reviews DESC
          LIMIT ?
        `;
        params = [startDate.toISOString(), parseInt(limit)];
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid leaderboard type'
        });
    }

    const leaderboard = await db.all(query, params);

    // Add ranking
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      total_revenue: parseFloat((user.total_revenue || 0).toFixed(2)),
      avg_order_value: parseFloat((user.avg_order_value || 0).toFixed(2)),
      avg_rating: parseFloat((user.avg_rating || 0).toFixed(1))
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        type,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// POST /api/users/:id/report - Report a user
router.post('/:id/report', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { reason, description } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Report reason is required'
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot report yourself'
      });
    }

    // Check if user exists
    const reportedUser = await req.database.getUserById(userId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log the report (in a real app, this would go to a reports table)
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'user_reported',
      eventData: {
        reportedUserId: userId,
        reason,
        description: description || ''
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User reported successfully. Our team will review this report.'
    });

  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report user'
    });
  }
});

module.exports = router;