const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class UserLookupService {
  constructor() {
    // Initialize database
    const dbPath = path.join(__dirname, '../data/users.db');
    this.db = new sqlite3.Database(dbPath);
    this.initDatabase();
  }

  /**
   * Initialize database tables
   */
  initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        telegram_id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT UNIQUE,
        wallet_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_username ON users(username);
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_phone ON users(phone_number);
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_wallet ON users(wallet_address);
    `);
  }

  /**
   * Register or update user
   */
  async registerUser(userData) {
    return new Promise((resolve, reject) => {
      const { telegramId, username, firstName, lastName, phoneNumber, walletAddress } = userData;

      this.db.run(
        `INSERT OR REPLACE INTO users 
         (telegram_id, username, first_name, last_name, phone_number, wallet_address, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [telegramId, username, firstName, lastName, phoneNumber, walletAddress],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, telegramId });
          }
        }
      );
    });
  }

  /**
   * Find user by Telegram username
   */
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      // Remove @ if present
      const cleanUsername = username.replace('@', '');

      this.db.get(
        'SELECT * FROM users WHERE username = ? COLLATE NOCASE',
        [cleanUsername],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phoneNumber) {
    return new Promise((resolve, reject) => {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

      this.db.get(
        'SELECT * FROM users WHERE phone_number = ?',
        [cleanPhone],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Find user by wallet address
   */
  async findByAddress(address) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE wallet_address = ? COLLATE NOCASE',
        [address],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Find user by Telegram ID
   */
  async findByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE telegram_id = ?',
        [telegramId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Search users by name or username
   */
  async searchUsers(query, limit = 10) {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${query}%`;

      this.db.all(
        `SELECT telegram_id, username, first_name, last_name, wallet_address 
         FROM users 
         WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?
         LIMIT ?`,
        [searchQuery, searchQuery, searchQuery, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Get Telegram ID from any identifier (username, phone, address)
   */
  async getTelegramId(identifier) {
    try {
      // Try as username
      if (identifier.startsWith('@') || !identifier.startsWith('0x')) {
        const user = await this.findByUsername(identifier);
        if (user) return user.telegram_id;
      }

      // Try as phone number
      if (identifier.startsWith('+') || /^\d+$/.test(identifier)) {
        const user = await this.findByPhone(identifier);
        if (user) return user.telegram_id;
      }

      // Try as wallet address
      if (identifier.startsWith('0x')) {
        const user = await this.findByAddress(identifier);
        if (user) return user.telegram_id;
      }

      // Try as direct Telegram ID
      if (/^\d+$/.test(identifier)) {
        const user = await this.findByTelegramId(identifier);
        if (user) return user.telegram_id;
      }

      return null;
    } catch (error) {
      console.error('Error getting Telegram ID:', error);
      return null;
    }
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user) {
    if (!user) return 'Unknown User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.first_name) {
      return user.first_name;
    }
    
    if (user.username) {
      return `@${user.username}`;
    }
    
    return `User ${user.telegram_id}`;
  }

  /**
   * Update user's wallet address
   */
  async updateWalletAddress(telegramId, walletAddress) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
        [walletAddress, telegramId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Get all users (for admin)
   */
  async getAllUsers(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Get user count
   */
  async getUserCount() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM users',
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

module.exports = UserLookupService;