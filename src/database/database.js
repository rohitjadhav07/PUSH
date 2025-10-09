const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database connection with better settings
      this.db = await open({
        filename: path.join(dbDir, 'pushpay.db'),
        driver: sqlite3.Database
      });

      // Configure SQLite for better concurrency
      await this.db.exec('PRAGMA foreign_keys = ON');
      await this.db.exec('PRAGMA journal_mode = WAL'); // Write-Ahead Logging for better concurrency
      await this.db.exec('PRAGMA synchronous = NORMAL'); // Faster writes
      await this.db.exec('PRAGMA cache_size = 1000'); // Larger cache
      await this.db.exec('PRAGMA temp_store = memory'); // Use memory for temp tables
      await this.db.exec('PRAGMA busy_timeout = 5000'); // 5 second timeout for busy database
      
      // Load and execute schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.db.exec(schema);

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
      
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
      telegramId,
      username,
      phoneNumber,
      walletAddress,
      privateKey,
      displayName
    } = userData;

    // Encrypt private key
    const encryptedPrivateKey = this.encryptPrivateKey(privateKey);
    
    // Generate referral code
    const referralCode = this.generateReferralCode();

    const result = await db.run(`
      INSERT INTO users (
        telegram_id, username, phone_number, wallet_address, 
        private_key, display_name, referral_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [telegramId, username, phoneNumber, walletAddress, encryptedPrivateKey, displayName, referralCode]);

    return result.lastID;
  }

  async getUserByTelegramId(telegramId) {
    const db = await this.getDb();
    const user = await db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    
    if (user && user.private_key) {
      user.private_key = this.decryptPrivateKey(user.private_key);
    }
    
    return user;
  }

  async getUserByWalletAddress(walletAddress) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
  }

  async getUserByPhoneNumber(phoneNumber) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);
  }

  async getUserByUsername(username) {
    const db = await this.getDb();
    return await db.get('SELECT * FROM users WHERE username = ? COLLATE NOCASE', [username]);
  }

  async updateUserSettings(userId, settings) {
    const db = await this.getDb();
    await db.run('UPDATE users SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [JSON.stringify(settings), userId]);
  }

  // Transaction Management
  async createTransaction(txData) {
    const db = await this.getDb();
    const {
      txHash, fromUserId, toUserId, toAddress, amount, tokenSymbol,
      fee, status, type, message, metadata
    } = txData;

    // Retry logic for database busy errors
    let retries = 3;
    while (retries > 0) {
      try {
        const result = await db.run(`
          INSERT INTO transactions (
            tx_hash, from_user_id, to_user_id, to_address, amount, 
            token_symbol, fee, status, type, message, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [txHash, fromUserId, toUserId, toAddress, amount, tokenSymbol, fee, status, type, message, JSON.stringify(metadata)]);

        console.log(`✅ Transaction recorded: ${txHash}`);
        return result.lastID;
      } catch (error) {
        if (error.code === 'SQLITE_BUSY' && retries > 1) {
          console.log(`⏳ Database busy, retrying... (${retries - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          retries--;
        } else {
          throw error;
        }
      }
    }
  }

  async updateTransactionStatus(txHash, status, blockNumber = null, gasUsed = null) {
    const db = await this.getDb();
    const result = await db.run(`
      UPDATE transactions 
      SET status = ?, block_number = ?, gas_used = ?, confirmed_at = CURRENT_TIMESTAMP 
      WHERE tx_hash = ?
    `, [status, blockNumber, gasUsed, txHash]);
    
    console.log(`✅ Updated transaction ${txHash} status to ${status}`);
    return result;
  }

  async getUserTransactions(userId, limit = 50, offset = 0) {
    const db = await this.getDb();
    return await db.all(`
      SELECT t.*, 
             u1.username as from_username, u1.display_name as from_display_name,
             u2.username as to_username, u2.display_name as to_display_name
      FROM transactions t
      LEFT JOIN users u1 ON t.from_user_id = u1.id
      LEFT JOIN users u2 ON t.to_user_id = u2.id
      WHERE t.from_user_id = ? OR t.to_user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, limit, offset]);
  }

  // Payment Requests
  async createPaymentRequest(requestData) {
    const db = await this.getDb();
    const { requesterId, payerId, amount, tokenSymbol, message, expiresAt } = requestData;

    const result = await db.run(`
      INSERT INTO payment_requests (
        requester_id, payer_id, amount, token_symbol, message, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [requesterId, payerId, amount, tokenSymbol, message, expiresAt]);

    return result.lastID;
  }

  async getPaymentRequest(requestId) {
    const db = await this.getDb();
    return await db.get(`
      SELECT pr.*, 
             u1.username as requester_username, u1.display_name as requester_name,
             u2.username as payer_username, u2.display_name as payer_name
      FROM payment_requests pr
      LEFT JOIN users u1 ON pr.requester_id = u1.id
      LEFT JOIN users u2 ON pr.payer_id = u2.id
      WHERE pr.id = ?
    `, [requestId]);
  }

  async getUserPaymentRequests(userId, status = null) {
    const db = await this.getDb();
    let query = `
      SELECT pr.*, 
             u1.username as requester_username, u1.display_name as requester_name,
             u2.username as payer_username, u2.display_name as payer_name
      FROM payment_requests pr
      LEFT JOIN users u1 ON pr.requester_id = u1.id
      LEFT JOIN users u2 ON pr.payer_id = u2.id
      WHERE pr.requester_id = ? OR pr.payer_id = ?
    `;
    
    const params = [userId, userId];
    
    if (status) {
      query += ' AND pr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pr.created_at DESC';
    
    return await db.all(query, params);
  }

  // Split Payments
  async createSplitPayment(splitData) {
    const db = await this.getDb();
    const { creatorId, totalAmount, tokenSymbol, description, participants } = splitData;

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create split payment
      const splitResult = await db.run(`
        INSERT INTO split_payments (creator_id, total_amount, token_symbol, description)
        VALUES (?, ?, ?, ?)
      `, [creatorId, totalAmount, tokenSymbol, description]);

      const splitId = splitResult.lastID;

      // Add participants
      for (const participant of participants) {
        await db.run(`
          INSERT INTO split_participants (split_id, user_id, amount_owed)
          VALUES (?, ?, ?)
        `, [splitId, participant.userId, participant.amount]);
      }

      await db.run('COMMIT');
      console.log(`✅ Split payment created: ${splitId}`);
      return splitId;
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  }

  async getSplitPayment(splitId) {
    const db = await this.getDb();
    return await db.get(`
      SELECT sp.*, u.display_name as creator_name, u.telegram_id as creator_telegram_id
      FROM split_payments sp
      LEFT JOIN users u ON sp.creator_id = u.id
      WHERE sp.id = ?
    `, [splitId]);
  }

  async getSplitParticipant(splitId, userId) {
    const db = await this.getDb();
    return await db.get(`
      SELECT * FROM split_participants 
      WHERE split_id = ? AND user_id = ?
    `, [splitId, userId]);
  }

  async updateSplitParticipant(splitId, userId, status) {
    const db = await this.getDb();
    await db.run(`
      UPDATE split_participants 
      SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
      WHERE split_id = ? AND user_id = ?
    `, [status, status, splitId, userId]);
  }

  async getSplitPaymentWithParticipants(splitId) {
    const db = await this.getDb();
    
    const split = await this.getSplitPayment(splitId);
    if (!split) return null;

    const participants = await db.all(`
      SELECT sp.*, u.display_name, u.telegram_id
      FROM split_participants sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.split_id = ?
    `, [splitId]);

    split.participants = participants;
    return split;
  }

  async updateSplitPaymentStatus(splitId, status) {
    const db = await this.getDb();
    await db.run(`
      UPDATE split_payments 
      SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = ?
    `, [status, status, splitId]);
  }

  // Notifications
  async createNotification(notificationData) {
    const db = await this.getDb();
    const { userId, type, title, message, data } = notificationData;

    const result = await db.run(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, type, title, message, JSON.stringify(data)]);

    return result.lastID;
  }

  async getUserNotifications(userId, unreadOnly = false, limit = 50) {
    const db = await this.getDb();
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    return await db.all(query, params);
  }

  async markNotificationAsRead(notificationId) {
    const db = await this.getDb();
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [notificationId]);
  }

  // Analytics
  async logAnalyticsEvent(eventData) {
    const db = await this.getDb();
    const { userId, eventType, eventData: data } = eventData;

    await db.run(`
      INSERT INTO analytics_events (user_id, event_type, event_data)
      VALUES (?, ?, ?)
    `, [userId, eventType, JSON.stringify(data)]);
  }

  async getAnalytics(startDate, endDate) {
    const db = await this.getDb();
    
    const userStats = await db.get(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_users
      FROM users
    `, [startDate]);

    const transactionStats = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_volume,
        AVG(amount) as avg_transaction_size
      FROM transactions 
      WHERE status = 'confirmed' AND created_at BETWEEN ? AND ?
    `, [startDate, endDate]);

    return { userStats, transactionStats };
  }

  // Utility methods
  encryptPrivateKey(privateKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptPrivateKey(encryptedPrivateKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const [ivHex, encrypted] = encryptedPrivateKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.isInitialized = false;
    }
  }
}

module.exports = new Database();