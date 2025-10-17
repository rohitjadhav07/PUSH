const { ethers } = require('ethers');
const crypto = require('crypto');

class WalletService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.PUSH_CHAIN_RPC_URL || 'https://rpc.push.org'
    );
    this.masterSeed = process.env.MASTER_WALLET_SEED || 'chainsync-universal-commerce-2025';
    this.faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    this.wallets = new Map(); // Cache for generated wallets
  }

  /**
   * Generate deterministic wallet from Telegram ID
   */
  generateWallet(telegramId) {
    try {
      // Check cache first
      if (this.wallets.has(telegramId)) {
        return this.wallets.get(telegramId);
      }

      // Create deterministic seed from Telegram ID
      const seed = crypto
        .createHash('sha256')
        .update(`${this.masterSeed}-${telegramId}`)
        .digest('hex');

      // Generate wallet from seed
      const wallet = new ethers.Wallet(seed, this.provider);

      // Cache the wallet
      this.wallets.set(telegramId, {
        address: wallet.address,
        wallet: wallet
      });

      return {
        address: wallet.address,
        telegramId: telegramId
      };
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw new Error('Failed to generate wallet');
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(telegramId) {
    try {
      const walletData = this.generateWallet(telegramId);
      const balance = await this.provider.getBalance(walletData.address);
      
      return {
        balance: ethers.formatEther(balance),
        address: walletData.address,
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Send tokens from one user to another
   */
  async sendTokens(fromTelegramId, toTelegramId, amount, message = '') {
    try {
      // Generate sender wallet
      const senderData = this.generateWallet(fromTelegramId);
      const senderWallet = this.wallets.get(fromTelegramId).wallet;

      // Generate receiver wallet
      const receiverData = this.generateWallet(toTelegramId);

      // Check sender balance
      const balance = await this.provider.getBalance(senderData.address);
      const amountWei = ethers.parseEther(amount.toString());

      if (balance < amountWei) {
        throw new Error('Insufficient balance');
      }

      // Estimate gas
      const gasLimit = 21000n;
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasCost = gasLimit * gasPrice;

      // Check if sender has enough for amount + gas
      if (balance < amountWei + gasCost) {
        throw new Error('Insufficient balance for transaction + gas');
      }

      // Create and send transaction
      const tx = await senderWallet.sendTransaction({
        to: receiverData.address,
        value: amountWei,
        gasLimit: gasLimit
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        from: senderData.address,
        to: receiverData.address,
        amount: amount,
        message: message,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error sending tokens:', error);
      throw new Error(error.message || 'Failed to send tokens');
    }
  }

  /**
   * Send tokens to an address (not Telegram ID)
   */
  async sendToAddress(fromTelegramId, toAddress, amount, message = '') {
    try {
      // Validate address
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      const senderData = this.generateWallet(fromTelegramId);
      const senderWallet = this.wallets.get(fromTelegramId).wallet;

      // Check balance
      const balance = await this.provider.getBalance(senderData.address);
      const amountWei = ethers.parseEther(amount.toString());

      if (balance < amountWei) {
        throw new Error('Insufficient balance');
      }

      // Estimate gas
      const gasLimit = 21000n;
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasCost = gasLimit * gasPrice;

      if (balance < amountWei + gasCost) {
        throw new Error('Insufficient balance for transaction + gas');
      }

      // Send transaction
      const tx = await senderWallet.sendTransaction({
        to: toAddress,
        value: amountWei,
        gasLimit: gasLimit
      });

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        from: senderData.address,
        to: toAddress,
        amount: amount,
        message: message,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error sending to address:', error);
      throw new Error(error.message || 'Failed to send tokens');
    }
  }

  /**
   * Request faucet tokens for testing
   */
  async requestFaucet(telegramId, amount = '10') {
    try {
      if (!this.faucetPrivateKey) {
        throw new Error('Faucet not configured');
      }

      const faucetWallet = new ethers.Wallet(this.faucetPrivateKey, this.provider);
      const recipientData = this.generateWallet(telegramId);

      // Check faucet balance
      const faucetBalance = await this.provider.getBalance(faucetWallet.address);
      const amountWei = ethers.parseEther(amount);

      if (faucetBalance < amountWei) {
        throw new Error('Faucet has insufficient funds');
      }

      // Send tokens
      const tx = await faucetWallet.sendTransaction({
        to: recipientData.address,
        value: amountWei,
        gasLimit: 21000n
      });

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
        recipient: recipientData.address
      };
    } catch (error) {
      console.error('Error requesting faucet:', error);
      throw new Error(error.message || 'Faucet request failed');
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(telegramId, limit = 10) {
    try {
      const walletData = this.generateWallet(telegramId);
      
      // Get latest block
      const latestBlock = await this.provider.getBlockNumber();
      const startBlock = Math.max(0, latestBlock - 10000); // Last ~10000 blocks

      // This is a simplified version - in production, use an indexer
      const transactions = [];
      
      // Get sent transactions
      const sentTxs = await this.provider.getHistory(walletData.address);
      
      for (const tx of sentTxs.slice(0, limit)) {
        const receipt = await this.provider.getTransactionReceipt(tx.hash);
        transactions.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          timestamp: (await this.provider.getBlock(tx.blockNumber)).timestamp,
          blockNumber: tx.blockNumber,
          status: receipt.status === 1 ? 'success' : 'failed',
          type: tx.from.toLowerCase() === walletData.address.toLowerCase() ? 'sent' : 'received'
        });
      }

      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Export wallet (encrypted)
   */
  async exportWallet(telegramId, password) {
    try {
      const walletData = this.generateWallet(telegramId);
      const wallet = this.wallets.get(telegramId).wallet;

      // Encrypt wallet with password
      const encryptedJson = await wallet.encrypt(password);

      return {
        success: true,
        encryptedWallet: encryptedJson,
        address: walletData.address
      };
    } catch (error) {
      console.error('Error exporting wallet:', error);
      throw new Error('Failed to export wallet');
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const feeData = await this.provider.getFeeData();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber: blockNumber,
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        rpcUrl: process.env.PUSH_CHAIN_RPC_URL
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw new Error('Failed to get network info');
    }
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(amount) {
    try {
      const feeData = await this.provider.getFeeData();
      const gasLimit = 21000n;
      const gasCost = gasLimit * feeData.gasPrice;
      const totalCost = ethers.parseEther(amount.toString()) + gasCost;

      return {
        amount: amount,
        gasCost: ethers.formatEther(gasCost),
        totalCost: ethers.formatEther(totalCost),
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei')
      };
    } catch (error) {
      console.error('Error estimating cost:', error);
      throw new Error('Failed to estimate cost');
    }
  }
}

module.exports = WalletService;