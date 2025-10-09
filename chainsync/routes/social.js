const express = require('express');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  // In a real app, this would verify JWT token
  req.user = { id: 1, username: 'demo_user' };
  next();
};

// GET /api/social/feed - Get social feed
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const db = await req.database.getDb();
    
    // Get feed items (products from followed users + public shares)
    const feedItems = await db.all(`
      SELECT 
        'product' as type,
        p.id as item_id,
        p.title,
        p.description,
        p.images,
        p.price_usd,
        p.created_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        p.likes_count,
        p.views_count
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN user_follows uf ON u.id = uf.following_id
      WHERE uf.follower_id = ? AND p.status = 'active'
      
      UNION ALL
      
      SELECT 
        'share' as type,
        ss.product_id as item_id,
        p.title,
        p.description,
        p.images,
        p.price_usd,
        ss.created_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        p.likes_count,
        p.views_count
      FROM social_shares ss
      JOIN products p ON ss.product_id = p.id
      JOIN users u ON ss.user_id = u.id
      WHERE p.status = 'active'
      
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), offset]);

    // Parse JSON fields
    const parsedFeedItems = feedItems.map(item => ({
      ...item,
      images: JSON.parse(item.images || '[]')
    }));

    res.json({
      success: true,
      data: {
        feedItems: parsedFeedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social feed'
    });
  }
});

// POST /api/social/follow/:userId - Follow a user
router.post('/follow/:userId', requireAuth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    
    if (isNaN(followingId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (followingId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await req.database.getUserById(followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Follow user
    const followed = await req.database.followUser(req.user.id, followingId);

    if (followed) {
      // Notify the followed user
      req.io.to(`user-${followingId}`).emit('new-follower', {
        followerId: req.user.id,
        followerUsername: req.user.username,
        followerName: req.user.display_name
      });

      // Log analytics event
      await req.database.logEvent({
        userId: req.user.id,
        eventType: 'user_followed',
        eventData: { followedUserId: followingId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      data: { followed },
      message: followed ? 'User followed successfully' : 'Already following this user'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
});

// DELETE /api/social/follow/:userId - Unfollow a user
router.delete('/follow/:userId', requireAuth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);
    
    if (isNaN(followingId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Unfollow user
    const unfollowed = await req.database.unfollowUser(req.user.id, followingId);

    res.json({
      success: true,
      data: { unfollowed },
      message: unfollowed ? 'User unfollowed successfully' : 'Was not following this user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user'
    });
  }
});

// GET /api/social/followers/:userId - Get user's followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const db = await req.database.getDb();
    const followers = await db.all(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
             u.seller_rating, u.followers_count, uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.following_id = ?
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    });
  }
});

// GET /api/social/following/:userId - Get users that user is following
router.get('/following/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const db = await req.database.getDb();
    const following = await db.all(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
             u.seller_rating, u.followers_count, uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = ?
      ORDER BY uf.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following'
    });
  }
});

// POST /api/social/share - Share a product
router.post('/share', requireAuth, async (req, res) => {
  try {
    const { productId, platform, message } = req.body;

    if (!productId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and platform are required'
      });
    }

    // Check if product exists
    const product = await req.database.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Generate share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/products/${productId}`;

    // Record the share
    const db = await req.database.getDb();
    await db.run(`
      INSERT INTO social_shares (user_id, product_id, platform, share_url)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, productId, platform, shareUrl]);

    // Update product shares count
    await db.run(`
      UPDATE products SET shares_count = shares_count + 1 WHERE id = ?
    `, [productId]);

    // Generate platform-specific share content
    const shareContent = generateShareContent(product, shareUrl, platform, message);

    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'product_shared',
      eventData: { productId, platform },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Emit real-time notification
    req.io.to(`product-${productId}`).emit('product-shared', {
      productId,
      platform,
      sharedBy: req.user.username
    });

    res.json({
      success: true,
      data: {
        shareUrl,
        shareContent,
        platform
      },
      message: 'Product shared successfully'
    });

  } catch (error) {
    console.error('Share product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share product'
    });
  }
});

// GET /api/social/trending - Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = '7d', limit = 20 } = req.query;
    
    // Calculate date range
    const daysAgo = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const db = await req.database.getDb();
    const trendingProducts = await db.all(`
      SELECT 
        p.*,
        u.username as seller_username,
        u.display_name as seller_name,
        u.avatar_url as seller_avatar,
        u.is_verified as seller_verified,
        (p.views_count + p.likes_count * 2 + p.shares_count * 3) as trend_score
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active' AND p.created_at >= ?
      ORDER BY trend_score DESC, p.created_at DESC
      LIMIT ?
    `, [startDate.toISOString(), parseInt(limit)]);

    // Parse JSON fields
    const parsedProducts = trendingProducts.map(product => ({
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      images: JSON.parse(product.images || '[]'),
      videos: JSON.parse(product.videos || '[]'),
      shipping_regions: JSON.parse(product.shipping_regions || '[]')
    }));

    res.json({
      success: true,
      data: {
        products: parsedProducts,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending products'
    });
  }
});

// GET /api/social/recommendations/:userId - Get personalized recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { limit = 10 } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const db = await req.database.getDb();
    
    // Get user's interests based on their activity
    const userInterests = await db.all(`
      SELECT p.category, COUNT(*) as interest_score
      FROM product_likes pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.user_id = ?
      GROUP BY p.category
      ORDER BY interest_score DESC
      LIMIT 5
    `, [userId]);

    let recommendations = [];

    if (userInterests.length > 0) {
      // Get recommendations based on user interests
      const categories = userInterests.map(interest => `'${interest.category}'`).join(',');
      
      recommendations = await db.all(`
        SELECT 
          p.*,
          u.username as seller_username,
          u.display_name as seller_name,
          u.avatar_url as seller_avatar,
          u.is_verified as seller_verified,
          (p.likes_count + p.views_count * 0.1) as recommendation_score
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.status = 'active' 
          AND p.category IN (${categories})
          AND p.seller_id != ?
          AND p.id NOT IN (
            SELECT product_id FROM product_likes WHERE user_id = ?
          )
        ORDER BY recommendation_score DESC, p.created_at DESC
        LIMIT ?
      `, [userId, userId, parseInt(limit)]);
    }

    // If not enough recommendations, fill with popular products
    if (recommendations.length < parseInt(limit)) {
      const remaining = parseInt(limit) - recommendations.length;
      const popularProducts = await db.all(`
        SELECT 
          p.*,
          u.username as seller_username,
          u.display_name as seller_name,
          u.avatar_url as seller_avatar,
          u.is_verified as seller_verified
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.status = 'active' 
          AND p.seller_id != ?
          AND p.id NOT IN (${recommendations.map(r => r.id).join(',') || '0'})
        ORDER BY p.likes_count DESC, p.views_count DESC
        LIMIT ?
      `, [userId, remaining]);

      recommendations = [...recommendations, ...popularProducts];
    }

    // Parse JSON fields
    const parsedRecommendations = recommendations.map(product => ({
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      images: JSON.parse(product.images || '[]'),
      videos: JSON.parse(product.videos || '[]'),
      shipping_regions: JSON.parse(product.shipping_regions || '[]')
    }));

    res.json({
      success: true,
      data: {
        recommendations: parsedRecommendations,
        basedOn: userInterests.length > 0 ? 'user_interests' : 'popular_products',
        userInterests
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

// GET /api/social/activity/:userId - Get user's social activity
router.get('/activity/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const db = await req.database.getDb();
    
    // Get user's recent activity
    const activities = await db.all(`
      SELECT 
        'like' as activity_type,
        pl.created_at,
        p.id as product_id,
        p.title as product_title,
        p.images as product_images,
        NULL as review_rating
      FROM product_likes pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.user_id = ?
      
      UNION ALL
      
      SELECT 
        'review' as activity_type,
        r.created_at,
        r.product_id,
        p.title as product_title,
        p.images as product_images,
        r.rating as review_rating
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.reviewer_id = ?
      
      UNION ALL
      
      SELECT 
        'share' as activity_type,
        ss.created_at,
        ss.product_id,
        p.title as product_title,
        p.images as product_images,
        NULL as review_rating
      FROM social_shares ss
      JOIN products p ON ss.product_id = p.id
      WHERE ss.user_id = ?
      
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, userId, parseInt(limit), offset]);

    // Parse JSON fields
    const parsedActivities = activities.map(activity => ({
      ...activity,
      product_images: JSON.parse(activity.product_images || '[]')
    }));

    res.json({
      success: true,
      data: {
        activities: parsedActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity'
    });
  }
});

// Helper function to generate platform-specific share content
function generateShareContent(product, shareUrl, platform, customMessage) {
  const baseMessage = customMessage || `Check out this amazing ${product.title} on ChainSync!`;
  
  const platformContent = {
    twitter: {
      text: `${baseMessage} 💫\n\n🏷️ $${product.price_usd}\n🛒 ${shareUrl}\n\n#ChainSync #UniversalCommerce #Web3Shopping`,
      url: shareUrl
    },
    discord: {
      content: `**${product.title}** 🛍️\n\n${baseMessage}\n\n💰 Price: $${product.price_usd}\n🔗 ${shareUrl}`,
      embeds: [{
        title: product.title,
        description: product.short_description || product.description.substring(0, 200),
        url: shareUrl,
        color: 0x00ff88,
        image: {
          url: product.images?.[0] || null
        }
      }]
    },
    telegram: {
      text: `🛍️ *${product.title}*\n\n${baseMessage}\n\n💰 Price: $${product.price_usd}\n🔗 [View Product](${shareUrl})`,
      parse_mode: 'Markdown'
    },
    whatsapp: {
      text: `🛍️ ${product.title}\n\n${baseMessage}\n\n💰 Price: $${product.price_usd}\n🔗 ${shareUrl}`
    }
  };

  return platformContent[platform] || { text: `${baseMessage}\n${shareUrl}` };
}

module.exports = router;