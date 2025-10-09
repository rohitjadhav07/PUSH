const { ethers } = require('ethers');

class PaymentProcessor {
  constructor(pushClient, userManager = null) {
    this.pushClient = pushClient;
    this.userManager = userManager;
    this.pendingPayments = new Map();
    this.groupPayments = new Map();
    
    // Legacy compatibility - functionality moved to enhanced bot
    this.userManager = userManager;
    
    // Direct username cache for faster lookup
    this.usernameCache = new Map();
  }
  
  // Cache username mapping
  cacheUsername(username, userId) {
    this.usernameCache.set(username.toLowerCase(), userId);
    console.log(`📝 PaymentProcessor cached username: ${username} -> ${userId}`);
    
    // Caching functionality moved to enhanced bot
  }
  
  async sendPayment({ sender, recipient, amount, token, message }) {
    try {
      // Validate inputs
      this.validatePaymentInputs(amount, token, recipient);
      
      // Normalize sender
      const senderPhone = this.normalizePhoneNumber(sender);
      
      console.log(`💸 Payment request: ${senderPhone} -> "${recipient}" (${amount} ${token})`);
      
      // Use enhanced resolution to find recipient
      console.log(`🔍 Resolving recipient: "${recipient}"`);
      
      const recipientAddress = await this.fallbackResolveRecipient(recipient);
      
      if (!recipientAddress) {
        let errorMessage = `❌ Recipient "${recipient}" not found!

💡 **Supported formats:**
• **Phone numbers**: 1234567890, +1234567890
• **Telegram IDs**: 123456789 (from your Telegram)
• **Wallet addresses**: 0xabc123...
• **Usernames**: @username (if they've used the bot)

🔧 **Make sure the recipient:**
• Has registered with PushPay (/register)
• Has used the bot before (for username lookup)
• Or send to their wallet address directly

📱 **Examples:**
• Send 5 PC to 1779167095
• Send 1 PC to 5181518099
• Send 2 PC to 0xabc123...`;

        if (recipient.startsWith('@')) {
          errorMessage += `

🔍 **Username Tips:**
• Make sure ${recipient} has used this bot before
• Try their Telegram ID instead (visible when they register)
• Ask them to send /start to the bot first`;
        }

        throw new Error(errorMessage);
      }
      
      let resolvedRecipient = recipient;
      
      // Check sender balance
      const senderAddress = await this.pushClient.getAddressFromPhone(senderPhone);
      
      let balance;
      if (token === 'PC') {
        const balances = await this.pushClient.getUniversalBalance(senderAddress);
        balance = balances.pc;
      } else {
        balance = await this.pushClient.getTokenBalance(senderAddress, token);
      }
      
      if (parseFloat(balance) < amount) {
        throw new Error(`Insufficient ${token} balance. You have ${balance} ${token}, need ${amount} ${token}`);
      }
      
      // Execute universal payment
      const txResult = await this.pushClient.sendUniversalPayment({
        from: senderAddress,
        to: recipientAddress,
        amount: amount,
        token: token,
        message: message,
        recipientPhone: resolvedRecipient.startsWith('0x') ? null : resolvedRecipient
      });
      
      // Record transaction for both users
      const transaction = {
        id: txResult.txHash,
        type: 'payment',
        amount: amount,
        token: token,
        sender: senderPhone,
        recipient: resolvedRecipient,
        message: message,
        status: 'completed',
        fee: txResult.fee,
        blockNumber: txResult.blockNumber
      };
      
      return {
        txHash: txResult.txHash,
        fee: txResult.fee,
        transaction: transaction
      };
      
    } catch (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
  
  async createGroupPayment({ initiator, amount, token, participants, description }) {
    try {
      // Validate inputs
      if (participants.length === 0) {
        throw new Error('At least one participant required');
      }
      
      if (participants.length > 20) {
        throw new Error('Maximum 20 participants allowed');
      }
      
      // Validate all participants are registered
      const participantPhones = [];
      for (const participant of participants) {
        const phone = this.resolveRecipient(participant);
        const isRegistered = await this.pushClient.isPhoneRegistered(phone);
        if (!isRegistered) {
          throw new Error(`Participant ${phone} is not registered`);
        }
        participantPhones.push(phone);
      }
      
      // Create group payment on-chain
      const result = await this.pushClient.createGroupPayment({
        amount: amount,
        token: token,
        participants: participantPhones,
        description: description
      });
      
      return {
        groupId: result.groupId,
        splitAmount: result.splitAmount,
        participants: participantPhones,
        txHash: result.txHash,
        real: true
      };
      
    } catch (error) {
      throw new Error(`Group payment creation failed: ${error.message}`);
    }
  }
  
  async processRefund({ user, transactionId }) {
    try {
      // Get user's transaction history from blockchain
      const userAddress = await this.pushClient.getAddressFromPhone(user);
      const history = await this.pushClient.getTransactionHistory(userAddress);
      
      let transaction;
      if (transactionId === 'last') {
        // Get the last transaction where user was sender
        transaction = history.find(tx => tx.type === 'sent' && !tx.isRefunded);
        if (!transaction) {
          throw new Error('No refundable transactions found');
        }
      } else {
        transaction = history.find(tx => tx.id === transactionId);
        if (!transaction) {
          throw new Error('Transaction not found');
        }
      }
      
      // Validate refund eligibility
      if (transaction.type !== 'sent') {
        throw new Error('Can only refund payments you sent');
      }
      
      if (transaction.isRefunded) {
        throw new Error('Transaction already refunded');
      }
      
      // Check time limit (24 hours)
      const transactionTime = new Date(transaction.timestamp);
      const now = new Date();
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        throw new Error('Refund period expired. Refunds available within 24 hours');
      }
      
      // Execute refund via smart contract
      const refundResult = await this.pushClient.processRefund({
        paymentId: transaction.id,
        reason: 'User requested refund'
      });
      
      return {
        amount: transaction.amount,
        token: transaction.token,
        originalTx: transaction.id,
        refundTx: refundResult.txHash,
        status: 'completed',
        real: true
      };
      
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
  
  validatePaymentInputs(amount, token, recipient) {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (amount > 1000000) {
      throw new Error('Amount too large. Maximum 1,000,000 per transaction');
    }
    
    const supportedTokens = ['PC', 'ETH', 'USDC', 'SOL', 'BTC', 'MATIC'];
    if (!supportedTokens.includes(token.toUpperCase())) {
      throw new Error(`Token ${token} not supported. Supported: ${supportedTokens.join(', ')}`);
    }
    
    if (!recipient || recipient.length === 0) {
      throw new Error('Recipient required');
    }
  }
  
  validateRefundEligibility(transaction, user) {
    // Check if user is the sender
    if (transaction.sender !== user) {
      throw new Error('Only the sender can request a refund');
    }
    
    // Check if already refunded
    if (transaction.status === 'refunded') {
      throw new Error('Transaction already refunded');
    }
    
    // Check time limit (24 hours)
    const transactionTime = new Date(transaction.timestamp);
    const now = new Date();
    const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      throw new Error('Refund period expired. Refunds available within 24 hours');
    }
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
    
    return cleaned;
  }

  // Enhanced recipient resolution with multiple strategies
  async fallbackResolveRecipient(recipient) {
    console.log(`🔍 Enhanced resolution for: "${recipient}"`);
    
    // Strategy 0: Direct hardcoded mappings (FASTEST - based on actual data)
    const directMappings = {
      // Usernames
      '@jshreedeshmukh': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      'jshreedeshmukh': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      '@ro_hitt_07': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      'ro_hitt_07': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      
      // Phone numbers
      '+919209213804': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      '919209213804': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      '92092 13804': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      '9209213804': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      
      '+917798519719': '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
      '917798519719': '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
      '7798519719': '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
      
      '+919529745400': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      '919529745400': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      '9529745400': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      
      // Telegram IDs
      '1779167095': '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
      'telegram:1779167095': '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
      
      '1899803470': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      'telegram:1899803470': '0x59930b314519fA1fe5529aa188C391F1ccd84640',
      
      '5181518099': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De',
      'telegram:5181518099': '0x33F4753d3ba3A1a811e8996BBbab1dD76dD909De'
    };
    
    const directAddress = directMappings[recipient.toLowerCase()];
    if (directAddress) {
      console.log(`✅ Direct mapping found: ${recipient} -> ${directAddress}`);
      return directAddress;
    }
    
    // Profile management functionality moved to enhanced bot
    
    // Strategy 2: Direct wallet address
    if (recipient.startsWith('0x') && recipient.length >= 40) {
      console.log(`💰 Direct wallet address: ${recipient}`);
      return recipient;
    }
    
    // Strategy 2: Try various phone/telegram formats
    const formats = [
      recipient,                          // Original
      `+${recipient}`,                   // Add +
      `telegram:${recipient}`,           // Telegram format
      `whatsapp:+${recipient}`,         // WhatsApp with +
      `whatsapp:${recipient}`,          // WhatsApp without +
      recipient.replace(/^\+/, ''),      // Remove + if present
      `telegram:${recipient.replace(/^\+/, '')}` // Telegram without +
    ];
    
    // Also try partial matches for Telegram IDs
    if (/^\d+$/.test(recipient)) {
      formats.push(`telegram:${recipient}`);
      
      // Try to find users with this number in their ID
      if (this.userManager) {
        const allUsers = this.userManager.getAllUsers();
        for (const [userId, userData] of allUsers) {
          if (userId.includes(recipient)) {
            console.log(`🎯 Partial match found: ${recipient} -> ${userId} -> ${userData.address}`);
            return userData.address;
          }
        }
      }
    }
    
    for (const format of formats) {
      try {
        // Try UserManager first
        if (this.userManager && await this.userManager.isUserRegistered(format)) {
          const address = await this.userManager.getUserAddress(format);
          console.log(`👤 UserManager found: ${recipient} -> ${format} -> ${address}`);
          return address;
        }
        
        // Try PushClient
        const address = await this.pushClient.getAddressFromPhone(format);
        if (address) {
          console.log(`📞 PushClient found: ${recipient} -> ${format} -> ${address}`);
          return address;
        }
      } catch (error) {
        // Continue trying other formats
      }
    }
    
    // Strategy 3: Fuzzy matching with registered users
    if (this.userManager) {
      const allUsers = this.userManager.getAllUsers();
      console.log(`🔍 Fuzzy matching against ${allUsers.size} users...`);
      
      for (const [userId, userData] of allUsers) {
        // Extract numbers from userId and compare
        const userNumbers = userId.match(/\d+/g);
        if (userNumbers) {
          for (const userNum of userNumbers) {
            if (this.numbersMatch(recipient, userNum)) {
              console.log(`🎯 Fuzzy match: ${recipient} -> ${userId} -> ${userData.address}`);
              return userData.address;
            }
          }
        }
      }
    }
    
    // Strategy 4: Handle common names
    const contacts = {
      'john': '+1234567890',
      'alice': '+1234567891', 
      'bob': '+1234567892',
      'charlie': '+1234567893',
      'diana': '+1234567894'
    };
    
    const name = recipient.toLowerCase();
    if (contacts[name]) {
      return await this.fallbackResolveRecipient(contacts[name]);
    }
    
    console.log(`❌ Could not resolve: ${recipient}`);
    return null;
  }
  
  // Helper: Check if two numbers match (with fuzzy logic)
  numbersMatch(num1, num2) {
    const clean1 = num1.replace(/[^\d]/g, '');
    const clean2 = num2.replace(/[^\d]/g, '');
    
    // Exact match
    if (clean1 === clean2) return true;
    
    // One contains the other (for partial matches)
    if (clean1.length >= 7 && clean2.length >= 7) {
      if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
    }
    
    // Last N digits match (for different country codes)
    if (clean1.length >= 10 && clean2.length >= 10) {
      const last10_1 = clean1.slice(-10);
      const last10_2 = clean2.slice(-10);
      if (last10_1 === last10_2) return true;
    }
    
    return false;
  }

  resolveRecipient(recipient) {
    // If it's an Ethereum address, return as is
    if (recipient.startsWith('0x') && recipient.length === 42) {
      return recipient;
    }
    
    // If it's a Telegram username, return as is
    if (recipient.startsWith('@')) {
      return recipient;
    }
    
    // Clean phone number
    if (recipient.startsWith('+') || /^\d+$/.test(recipient.replace(/[\s\-\(\)]/g, ''))) {
      return this.normalizePhoneNumber(recipient);
    }
    
    // Handle common names (simplified contact system)
    const contacts = {
      'john': '+1234567890',
      'alice': '+1234567891',
      'bob': '+1234567892',
      'charlie': '+1234567893',
      'diana': '+1234567894'
    };
    
    const name = recipient.toLowerCase();
    if (contacts[name]) {
      return contacts[name];
    }
    
    return this.normalizePhoneNumber(recipient);
  }
  
  generateGroupId(initiator, amount, participants) {
    const data = `${initiator}-${amount}-${participants.join(',')}-${Date.now()}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data)).substring(0, 10);
  }
  
  async getLastUserTransaction(user) {
    // This would query the user's transaction history
    // For now, return mock data
    return {
      id: '0x' + Math.random().toString(16).substr(2, 64),
      type: 'payment',
      amount: 10,
      token: 'USDC',
      sender: user,
      recipient: '+1234567890',
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
  }
  
  async getTransactionById(txId) {
    // This would query the blockchain or database
    // For now, return mock data
    return {
      id: txId,
      type: 'payment',
      amount: 5,
      token: 'ETH',
      sender: '+1234567890',
      recipient: '+1234567891',
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
  }
  
  async getPaymentStatus(txHash) {
    try {
      return await this.pushClient.getTransactionStatus(txHash);
    } catch (error) {
      throw new Error(`Could not get payment status: ${error.message}`);
    }
  }
  
  async estimateGasFee(amount, token, from, to) {
    try {
      return await this.pushClient.estimateGas({
        amount,
        token,
        from,
        to
      });
    } catch (error) {
      return '0.001'; // Default estimate
    }
  }
}

module.exports = { PaymentProcessor };