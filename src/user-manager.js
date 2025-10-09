const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

class UserManager {
  constructor(pushClient) {
    this.pushClient = pushClient;
    this.usersFile = path.join(__dirname, '../data/users.json');
    this.users = new Map();
    this.loadUsers();
  }

  // Normalize phone number by removing whatsapp: prefix and cleaning Unicode
  normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return phoneNumber;
    
    // Remove whatsapp: prefix
    let cleaned = phoneNumber.replace(/^whatsapp:/, '');
    
    // Remove invisible Unicode characters and control characters
    cleaned = cleaned
      .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();
    
    // Clean phone number format
    cleaned = cleaned.replace(/[^\+\d]/g, '');
    
    console.log(`Normalized phone: "${phoneNumber}" -> "${cleaned}"`);
    return cleaned;
  }
  
  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      const usersData = JSON.parse(data);
      
      // Migrate old phone number format to normalized format
      const migratedUsers = new Map();
      let migrationNeeded = false;
      
      for (const [oldPhone, userData] of Object.entries(usersData)) {
        const normalizedPhone = this.normalizePhoneNumber(oldPhone);
        
        if (oldPhone !== normalizedPhone) {
          console.log(`Migrating user: "${oldPhone}" -> "${normalizedPhone}"`);
          userData.phoneNumber = normalizedPhone;
          migrationNeeded = true;
        }
        
        migratedUsers.set(normalizedPhone, userData);
      }
      
      this.users = migratedUsers;
      
      // Save migrated data if needed
      if (migrationNeeded) {
        console.log('Saving migrated user data...');
        await this.saveUsers();
      }
      
    } catch (error) {
      // File doesn't exist yet, start with empty users
      this.users = new Map();
    }
  }
  
  async saveUsers() {
    try {
      await fs.mkdir(path.dirname(this.usersFile), { recursive: true });
      const usersData = Object.fromEntries(this.users);
      await fs.writeFile(this.usersFile, JSON.stringify(usersData, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }
  
  async ensureUserRegistered(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    if (!this.users.has(normalizedPhone)) {
      await this.registerUser(normalizedPhone);
    }
    return this.users.get(normalizedPhone);
  }
  
  async registerUser(phoneNumber) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      console.log(`Registering phone ${normalizedPhone} on-chain...`);
      
      // Create deterministic wallet from phone number
      const wallet = await this.createWalletFromPhone(normalizedPhone);
      
      // Try to register on Push Chain (skip if ENS error)
      try {
        if (this.pushClient && this.pushClient.connected) {
          await this.pushClient.registerPhoneNumber(normalizedPhone, wallet.address);
        }
      } catch (error) {
        if (error.code === 'UNSUPPORTED_OPERATION' && error.operation === 'getEnsAddress') {
          console.warn('ENS not supported - using mock registration');
        } else {
          console.warn('Push Chain registration failed:', error.message);
        }
      }
      
      const userData = {
        phoneNumber: normalizedPhone,
        address: wallet.address,
        privateKey: wallet.privateKey,
        createdAt: new Date().toISOString(),
        transactions: []
      };
      
      this.users.set(normalizedPhone, userData);
      await this.saveUsers();
      
      // Auto-request testnet tokens for new users
      // Faucet functionality moved to enhanced bot
      console.log(`New user registered: ${wallet.address}`);
      
      return userData;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  async createWalletFromPhone(phoneNumber) {
    try {
      // Create deterministic wallet from phone number + salt
      const salt = process.env.WALLET_SALT || 'pushpay-universal-2024';
      const seed = ethers.keccak256(ethers.toUtf8Bytes(phoneNumber + salt));
      const wallet = new ethers.Wallet(seed);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      // Handle any wallet creation errors
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet for phone number');
    }
  }
  
  async getUserBalance(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const user = this.users.get(normalizedPhone);
    if (!user) {
      throw new Error('User not registered');
    }
    
    try {
      return await this.pushClient.getUniversalBalance(user.address);
    } catch (error) {
      throw new Error(`Could not fetch balance: ${error.message}`);
    }
  }
  
  async getUserAddress(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const user = this.users.get(normalizedPhone);
    if (!user) {
      throw new Error('User not registered');
    }
    return user.address;
  }
  
  async addTransaction(phoneNumber, transaction) {
    const user = this.users.get(phoneNumber);
    if (!user) {
      throw new Error('User not registered');
    }
    
    user.transactions.push({
      ...transaction,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 transactions
    if (user.transactions.length > 100) {
      user.transactions = user.transactions.slice(-100);
    }
    
    this.users.set(phoneNumber, user);
    await this.saveUsers();
  }
  
  async getTransactionHistory(phoneNumber, limit = 10) {
    const user = this.users.get(phoneNumber);
    if (!user) {
      throw new Error('User not registered');
    }
    
    try {
      // Get real transaction history from blockchain
      const onChainHistory = await this.pushClient.getTransactionHistory(user.address);
      
      if (onChainHistory && onChainHistory.length > 0) {
        console.log(`✅ Retrieved ${onChainHistory.length} transactions from blockchain`);
        return onChainHistory.slice(0, limit);
      }
      
      // Fallback to local storage if blockchain query fails
      return user.transactions
        .slice(-limit)
        .reverse(); // Most recent first
        
    } catch (error) {
      console.warn('Error fetching on-chain history, using local:', error.message);
      return user.transactions
        .slice(-limit)
        .reverse();
    }
  }
  
  async getLastTransaction(phoneNumber) {
    const user = this.users.get(phoneNumber);
    if (!user || user.transactions.length === 0) {
      throw new Error('No transactions found');
    }
    
    return user.transactions[user.transactions.length - 1];
  }
  
  getUserByAddress(address) {
    for (const [phone, user] of this.users) {
      if (user.address.toLowerCase() === address.toLowerCase()) {
        return { phone, ...user };
      }
    }
    return null;
  }
  
  resolveRecipient(recipient) {
    // If it's a phone number, return as is
    if (recipient.startsWith('+') || /^\d+$/.test(recipient)) {
      return recipient;
    }
    
    // If it's a name, try to find in contacts (simplified)
    // In a real implementation, you'd have a contacts system
    const commonNames = {
      'john': '+1234567890',
      'alice': '+1234567891',
      'bob': '+1234567892'
    };
    
    return commonNames[recipient.toLowerCase()] || recipient;
  }
  
  async isUserRegistered(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    return this.users.has(normalizedPhone);
  }
  
  async getUserCount() {
    return this.users.size;
  }
  
  async getActiveUsers(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    let activeCount = 0;
    for (const [phone, user] of this.users) {
      const lastTx = user.transactions[user.transactions.length - 1];
      if (lastTx && new Date(lastTx.timestamp) > cutoff) {
        activeCount++;
      }
    }
    
    return activeCount;
  }
  
  // Get all registered users (for resolver)
  getAllUsers() {
    return this.users;
  }
  
  // Debug: List all registered users
  listAllUsers() {
    console.log(`📋 All registered users (${this.users.size}):`);
    for (const [userId, userData] of this.users) {
      console.log(`   ${userId} -> ${userData.address}`);
    }
  }
}

module.exports = { UserManager };