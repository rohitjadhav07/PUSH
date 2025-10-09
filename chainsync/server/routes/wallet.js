const express = require('express');
const router = express.Router();

/**
 * Wallet Management Routes
 * Handles wallet creation, balance checking, and transactions
 */

// Generate wallet from Telegram ID
router.post('/generate', async (req, res) => {
    try {
        const { telegramId } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID is required'
            });
        }

        if (!req.walletManager.isValidTelegramId(telegramId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Telegram ID format'
            });
        }

        const walletData = req.walletManager.generateWalletFromTelegramId(telegramId);
        
        res.json({
            success: true,
            data: {
                address: walletData.address,
                telegramId: walletData.telegramId,
                qrData: req.walletManager.generateQRData(telegramId)
            }
        });
    } catch (error) {
        console.error('Error generating wallet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate wallet'
        });
    }
});

// Get wallet balance
router.get('/balance/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const balance = await req.walletManager.getBalance(telegramId);
        const address = req.walletManager.getAddress(telegramId);
        
        res.json({
            success: true,
            data: {
                balance: balance,
                address: address,
                currency: 'PC'
            }
        });
    } catch (error) {
        console.error('Error getting balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get balance'
        });
    }
});

// Send tokens between users
router.post('/send', async (req, res) => {
    try {
        const { fromTelegramId, toTelegramId, amount, message } = req.body;
        
        if (!fromTelegramId || !toTelegramId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0'
            });
        }

        const result = await req.walletManager.sendTokens(fromTelegramId, toTelegramId, amount);
        
        if (result.success) {
            // Also record in smart contract if needed
            try {
                await req.chainsync.sendPayment(fromTelegramId, toTelegramId, amount, message || '');
            } catch (contractError) {
                console.warn('Smart contract payment failed:', contractError.message);
                // Continue with wallet-level transaction
            }
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error sending tokens:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send tokens'
        });
    }
});

// Request faucet tokens
router.post('/faucet', async (req, res) => {
    try {
        const { telegramId } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID is required'
            });
        }

        const result = await req.walletManager.requestFaucet(telegramId);
        
        res.json(result);
    } catch (error) {
        console.error('Error requesting faucet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request faucet tokens'
        });
    }
});

// Get transaction history
router.get('/history/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const { limit = 10 } = req.query;
        
        const history = await req.walletManager.getTransactionHistory(telegramId, parseInt(limit));
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting transaction history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get transaction history'
        });
    }
});

// Export wallet (encrypted)
router.post('/export', async (req, res) => {
    try {
        const { telegramId, password } = req.body;
        
        if (!telegramId || !password) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }

        const encryptedWallet = await req.walletManager.exportWallet(telegramId, password);
        
        res.json({
            success: true,
            data: {
                encryptedWallet: encryptedWallet,
                warning: 'Keep this backup safe and never share your password'
            }
        });
    } catch (error) {
        console.error('Error exporting wallet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export wallet'
        });
    }
});

// Get network information
router.get('/network', async (req, res) => {
    try {
        const networkInfo = await req.walletManager.getNetworkInfo();
        
        res.json({
            success: true,
            data: networkInfo
        });
    } catch (error) {
        console.error('Error getting network info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get network information'
        });
    }
});

module.exports = router;