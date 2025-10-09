const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * ChainSync Wallet Manager
 * Generates deterministic wallets from Telegram user IDs
 */
class WalletManager {
    constructor(masterSeed = process.env.MASTER_WALLET_SEED) {
        this.masterSeed = masterSeed || 'chainsync-universal-commerce-2025';
        this.provider = new ethers.JsonRpcProvider(process.env.PUSH_CHAIN_RPC_URL);
    }

    /**
     * Generate deterministic wallet from Telegram ID
     * @param {string} telegramId - User's Telegram ID
     * @returns {Object} Wallet object with address and private key
     */
    generateWalletFromTelegramId(telegramId) {
        try {
            // Create deterministic seed from Telegram ID and master seed
            const combinedSeed = `${this.masterSeed}-${telegramId}`;
            const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
            
            // Generate wallet from hash
            const wallet = new ethers.Wallet(hash, this.provider);
            
            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
                telegramId: telegramId,
                wallet: wallet
            };
        } catch (error) {
            console.error('Error generating wallet:', error);
            throw new Error('Failed to generate wallet');
        }
    }

    /**
     * Get wallet instance from Telegram ID
     * @param {string} telegramId - User's Telegram ID
     * @returns {ethers.Wallet} Wallet instance
     */
    getWallet(telegramId) {
        const walletData = this.generateWalletFromTelegramId(telegramId);
        return walletData.wallet;
    }

    /**
     * Get wallet address from Telegram ID
     * @param {string} telegramId - User's Telegram ID
     * @returns {string} Wallet address
     */
    getAddress(telegramId) {
        const walletData = this.generateWalletFromTelegramId(telegramId);
        return walletData.address;
    }

    /**
     * Get wallet balance
     * @param {string} telegramId - User's Telegram ID
     * @returns {Promise<string>} Balance in PC tokens
     */
    async getBalance(telegramId) {
        try {
            const wallet = this.getWallet(telegramId);
            const balance = await wallet.provider.getBalance(wallet.address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    /**
     * Send PC tokens from one Telegram user to another
     * @param {string} fromTelegramId - Sender's Telegram ID
     * @param {string} toTelegramId - Recipient's Telegram ID
     * @param {string} amount - Amount in PC tokens
     * @returns {Promise<Object>} Transaction result
     */
    async sendTokens(fromTelegramId, toTelegramId, amount) {
        try {
            const senderWallet = this.getWallet(fromTelegramId);
            const recipientAddress = this.getAddress(toTelegramId);
            
            // Check sender balance
            const balance = await senderWallet.provider.getBalance(senderWallet.address);
            const amountWei = ethers.parseEther(amount);
            
            if (balance < amountWei) {
                throw new Error('Insufficient balance');
            }

            // Estimate gas
            const gasEstimate = await senderWallet.provider.estimateGas({
                to: recipientAddress,
                value: amountWei
            });

            // Send transaction
            const tx = await senderWallet.sendTransaction({
                to: recipientAddress,
                value: amountWei,
                gasLimit: gasEstimate
            });

            // Wait for confirmation
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                from: senderWallet.address,
                to: recipientAddress,
                amount: amount,
                gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('Error sending tokens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get transaction history for a Telegram user
     * @param {string} telegramId - User's Telegram ID
     * @param {number} limit - Number of transactions to fetch
     * @returns {Promise<Array>} Transaction history
     */
    async getTransactionHistory(telegramId, limit = 10) {
        try {
            const address = this.getAddress(telegramId);
            
            // Get latest block number
            const latestBlock = await this.provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - 10000); // Last ~10k blocks
            
            // This is a simplified version - in production, you'd use event logs
            // or a proper indexing service
            const transactions = [];
            
            // For now, return empty array - would need proper indexing
            return transactions;
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return [];
        }
    }

    /**
     * Request test tokens from faucet
     * @param {string} telegramId - User's Telegram ID
     * @returns {Promise<Object>} Faucet result
     */
    async requestFaucet(telegramId) {
        try {
            const address = this.getAddress(telegramId);
            
            // Check if user already has tokens
            const balance = await this.getBalance(telegramId);
            if (parseFloat(balance) > 1) {
                return {
                    success: false,
                    error: 'You already have sufficient tokens'
                };
            }

            // Use faucet wallet to send tokens
            const faucetWallet = new ethers.Wallet(
                process.env.FAUCET_PRIVATE_KEY || process.env.PUSH_CHAIN_PRIVATE_KEY,
                this.provider
            );

            const faucetAmount = ethers.parseEther('2'); // 2 PC tokens
            
            const tx = await faucetWallet.sendTransaction({
                to: address,
                value: faucetAmount
            });

            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.hash,
                amount: '2',
                message: 'Faucet tokens sent successfully!'
            };
        } catch (error) {
            console.error('Error requesting faucet:', error);
            return {
                success: false,
                error: 'Faucet request failed'
            };
        }
    }

    /**
     * Validate Telegram ID format
     * @param {string} telegramId - Telegram ID to validate
     * @returns {boolean} Is valid
     */
    isValidTelegramId(telegramId) {
        return /^\d+$/.test(telegramId) && telegramId.length >= 5;
    }

    /**
     * Generate QR code data for wallet address
     * @param {string} telegramId - User's Telegram ID
     * @returns {string} QR code data
     */
    generateQRData(telegramId) {
        const address = this.getAddress(telegramId);
        return `ethereum:${address}`;
    }

    /**
     * Export wallet for backup (encrypted)
     * @param {string} telegramId - User's Telegram ID
     * @param {string} password - Encryption password
     * @returns {Promise<string>} Encrypted wallet JSON
     */
    async exportWallet(telegramId, password) {
        try {
            const wallet = this.getWallet(telegramId);
            const encryptedWallet = await wallet.encrypt(password);
            return encryptedWallet;
        } catch (error) {
            console.error('Error exporting wallet:', error);
            throw new Error('Failed to export wallet');
        }
    }

    /**
     * Get network information
     * @returns {Promise<Object>} Network info
     */
    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getFeeData();

            return {
                chainId: network.chainId.toString(),
                name: network.name,
                blockNumber: blockNumber,
                gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0'
            };
        } catch (error) {
            console.error('Error getting network info:', error);
            return null;
        }
    }
}

module.exports = WalletManager;