const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ChainSyncDatabase {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database connection with optimizations
      this.db = await open({
        filename: path.join(dbDir, 'chainsync.db'),
        driver: sqlite3.Database
      });

      // Configure SQLite for better performance and concurrency
      await this.db.exec('PRAGMA foreign_keys = ON');
      await this.db.exec('PRAGMA journal_mode = WAL');
      await this.db.exec('PRAGMA synchronous = NORMAL');
      await this.db.exec('PRAGMA cache_size = 2000');
      await this.db.exec('PRAGMA temp_store = memory');
      await this.db.exec('PRAGMA busy_timeout = 10000');
      
      // Load and execute schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.db.exec(schema);

      this.isInitialized = true;
      console.log('✅ ChainSync Database initialized successfully');
      
      return this.db;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async getDb() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db;
  }

  // User Management
  async createUser(userData) {
    const db = await this.getDb();
    const {
      username,
      email,
      displayName,
      passwordHash,
      ethereumAddress,
      polygonAddress,
      solanaAddress,
      baseAddress,
      pushChainAddress
    } = userData;

    const result = await db.run(`
      INSERT INTO users (
        username, email, display_name, password_hash,
        ethereum_address, polygon_address, solana_address, 
        base_address, push_chain_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username, email, displayName, passwordHash,
      ethereumAddress, polygonAddress, solanaAddress,
      baseAddress, pushChainAddress
    ]);

    console.log(`✅ User created: ${username} (ID: ${result.lastID})`);
    return result.lastID;
  }

  async getUserById(userId) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  }

  async getUserByUsername(username) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE username = ? COLLATE NOCASE', [username]);
  }

  async getUserByEmail(email) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE email = ? COLLATE NOCASE', [email]);
  }

  async getUserByWalletAddress(address) {
    const db = await this.getDb();
    return await db.get(`
      SELECT * FROM users 
      WHERE ethereum_address = ? OR polygon_address = ? OR 
            solana_address = ? OR base_address = ? OR push_chain_address = ?
    `, [address, address, address, address, address]);
  }

  async updateUserProfile(userId, updates) {
    const db = await this.getDb();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(userId);

    await db.run(`
      UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);
  }

  // Product Management
  async createProduct(productData) {
    const db = await this.getDb();
    const {
      sellerId, title, description, shortDescription,
      pricePc, priceEth, priceMatic, priceSol, priceUsd,
      category, subcategory, tags, condition, brand, model,
      quantity, unlimitedQuantity, digitalProduct,
      images, videos, shippingRequired, shippingCostUsd,
      shippingRegions, processingTimeDays, slug
    } = productData;

    const result = await db.run(`
      INSERT INTO products (
        seller_id, title, description, short_description,
        price_pc, price_eth, price_matic, price_sol, price_usd,
        category, subcategory, tags, condition, brand, model,
        quantity, unlimited_quantity, digital_product,
        images, videos, shipping_required, shipping_cost_usd,
        shipping_regions, processing_time_days, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sellerId, title, description, shortDescription,
      pricePc, priceEth, priceMatic, priceSol, priceUsd,
      category, subcategory, JSON.stringify(tags), condition, brand, model,
      quantity, unlimitedQuantity, digitalProduct,
      JSON.stringify(images), JSON.stringify(videos), shippingRequired, shippingCostUsd,
      JSON.stringify(shippingRegions), processingTimeDays, slug
    ]);

    console.log(`✅ Product created: ${title} (ID: ${result.lastID})`);
    return result.lastID;
  }

  async getProductById(productId) {
    const db = await this.getDb();
    const product = await db.get(`
      SELECT p.*, u.username as seller_username, u.display_name as seller_name,
             u.seller_rating, u.is_verified as seller_verified
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ? AND p.status = 'active'
    `, [productId]);

    if (product) {
      // Parse JSON fields
      product.tags = JSON.parse(product.tags || '[]');
      product.images = JSON.parse(product.images || '[]');
      product.videos = JSON.parse(product.videos || '[]');
      product.shipping_regions = JSON.parse(product.shipping_regions || '[]');
    }

    return product;
  }

  async getProducts(filters = {}, limit = 20, offset = 0) {
    const db = await this.getDb();
    let query = `
      SELECT p.*, u.username as seller_username, u.display_name as seller_name,
             u.seller_rating, u.is_verified as seller_verified
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    const params = [];

    // Apply filters
    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }
    if (filters.sellerId) {
      query += ' AND p.seller_id = ?';
      params.push(filters.sellerId);
    }
    if (filters.search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.minPrice) {
      query += ' AND p.price_usd >= ?';
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ' AND p.price_usd <= ?';
      params.push(filters.maxPrice);
    }
    if (filters.featured) {
      query += ' AND p.featured = 1';
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY p.${sortBy} ${sortOrder}`;

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await db.all(query, params);

    // Parse JSON fields for each product
    return products.map(product => ({
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      images: JSON.parse(product.images || '[]'),
      videos: JSON.parse(product.videos || '[]'),
      shipping_regions: JSON.parse(product.shipping_regions || '[]')
    }));
  }

  async updateProductViews(productId) {
    const db = await this.getDb();
    await db.run('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [productId]);
  }

  // Order Management
  async createOrder(orderData) {
    const db = await this.getDb();
    const {
      orderNumber, buyerId, sellerId, productId, quantity,
      unitPrice, totalAmount, currency, paymentChain,
      buyerAddress, sellerAddress, shippingAddress
    } = orderData;

    const result = await db.run(`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, product_id, quantity,
        unit_price, total_amount, currency, payment_chain,
        buyer_address, seller_address, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber, buyerId, sellerId, productId, quantity,
      unitPrice, totalAmount, currency, paymentChain,
      buyerAddress, sellerAddress, JSON.stringify(shippingAddress)
    ]);

    console.log(`✅ Order created: ${orderNumber} (ID: ${result.lastID})`);
    return result.lastID;
  }

  async getOrderById(orderId) {
    const db = await this.getDb();
    const order = await db.get(`
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             buyer.username as buyer_username, buyer.display_name as buyer_name,
             seller.username as seller_username, seller.display_name as seller_name
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN users seller ON o.seller_id = seller.id
      WHERE o.id = ?
    `, [orderId]);

    if (order) {
      order.shipping_address = JSON.parse(order.shipping_address || '{}');
      order.product_images = JSON.parse(order.product_images || '[]');
    }

    return order;
  }

  async getUserOrders(userId, limit = 20, offset = 0) {
    const db = await this.getDb();
    return await db.all(`
      SELECT o.*, 
             p.title as product_title, p.images as product_images,
             buyer.username as buyer_username, buyer.display_name as buyer_name,
             seller.username as seller_username, seller.display_name as seller_name
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN users seller ON o.seller_id = seller.id
      WHERE o.buyer_id = ? OR o.seller_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, limit, offset]);
  }

  async updateOrderStatus(orderId, status, additionalData = {}) {
    const db = await this.getDb();
    const updates = { status, ...additionalData };
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(orderId);

    await db.run(`
      UPDATE orders SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    console.log(`✅ Order ${orderId} status updated to: ${status}`);
  }

  // Review System
  async createReview(reviewData) {
    const db = await this.getDb();
    const {
      orderId, reviewerId, reviewedUserId, productId,
      rating, title, content, images
    } = reviewData;

    const result = await db.run(`
      INSERT INTO reviews (
        order_id, reviewer_id, reviewed_user_id, product_id,
        rating, title, content, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, reviewerId, reviewedUserId, productId,
      rating, title, content, JSON.stringify(images || [])
    ]);

    // Update seller rating
    await this.updateSellerRating(reviewedUserId);

    console.log(`✅ Review created for product ${productId}`);
    return result.lastID;
  }

  async updateSellerRating(sellerId) {
    const db = await this.getDb();
    const result = await db.get(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
      FROM reviews 
      WHERE reviewed_user_id = ? AND status = 'active'
    `, [sellerId]);

    if (result && result.review_count > 0) {
      await db.run(`
        UPDATE users SET seller_rating = ? WHERE id = ?
      `, [parseFloat(result.avg_rating).toFixed(2), sellerId]);
    }
  }

  async getProductReviews(productId, limit = 10, offset = 0) {
    const db = await this.getDb();
    return await db.all(`
      SELECT r.*, u.username as reviewer_username, u.display_name as reviewer_name,
             u.avatar_url as reviewer_avatar
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.product_id = ? AND r.status = 'active'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [productId, limit, offset]);
  }

  // Social Features
  async followUser(followerId, followingId) {
    const db = await this.getDb();
    
    try {
      await db.run(`
        INSERT INTO user_follows (follower_id, following_id)
        VALUES (?, ?)
      `, [followerId, followingId]);

      // Update follower counts
      await db.run('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [followerId]);
      await db.run('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [followingId]);

      console.log(`✅ User ${followerId} now follows ${followingId}`);
      return true;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return false; // Already following
      }
      throw error;
    }
  }

  async unfollowUser(followerId, followingId) {
    const db = await this.getDb();
    
    const result = await db.run(`
      DELETE FROM user_follows 
      WHERE follower_id = ? AND following_id = ?
    `, [followerId, followingId]);

    if (result.changes > 0) {
      // Update follower counts
      await db.run('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [followerId]);
      await db.run('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [followingId]);
      
      console.log(`✅ User ${followerId} unfollowed ${followingId}`);
      return true;
    }
    return false;
  }

  async likeProduct(userId, productId) {
    const db = await this.getDb();
    
    try {
      await db.run(`
        INSERT INTO product_likes (user_id, product_id)
        VALUES (?, ?)
      `, [userId, productId]);

      await db.run('UPDATE products SET likes_count = likes_count + 1 WHERE id = ?', [productId]);
      return true;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return false; // Already liked
      }
      throw error;
    }
  }

  async unlikeProduct(userId, productId) {
    const db = await this.getDb();
    
    const result = await db.run(`
      DELETE FROM product_likes 
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    if (result.changes > 0) {
      await db.run('UPDATE products SET likes_count = likes_count - 1 WHERE id = ?', [productId]);
      return true;
    }
    return false;
  }

  // Analytics
  async logEvent(eventData) {
    const db = await this.getDb();
    const { userId, eventType, eventData: data, ipAddress, userAgent } = eventData;

    await db.run(`
      INSERT INTO analytics_events (user_id, event_type, event_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, eventType, JSON.stringify(data), ipAddress, userAgent]);
  }

  async getAnalytics(startDate, endDate) {
    const db = await this.getDb();
    
    const userStats = await db.get(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_users,
        COUNT(CASE WHEN is_seller = 1 THEN 1 END) as total_sellers
      FROM users
    `, [startDate]);

    const productStats = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products
      FROM products
    `, [startDate]);

    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_volume,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
      FROM orders 
      WHERE created_at BETWEEN ? AND ?
    `, [startDate, endDate]);

    return { userStats, productStats, orderStats };
  }

  // Utility methods
  generateOrderNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CS-${timestamp}-${random}`.toUpperCase();
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.isInitialized = false;
    }
  }
}

module.exports = new ChainSyncDatabase();