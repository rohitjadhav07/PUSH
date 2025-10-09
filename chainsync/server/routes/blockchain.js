const express = require('express');
const router = express.Router();

/**
 * Blockchain Integration Routes
 * Handles smart contract interactions and on-chain operations
 */

// Register user on blockchain
router.post('/register', async (req, res) => {
    try {
        const { telegramId, username, profileHash } = req.body;
        
        if (!telegramId || !username) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID and username are required'
            });
        }

        // Generate wallet first
        const walletData = req.walletManager.generateWalletFromTelegramId(telegramId);
        
        // Register on smart contract
        const result = await req.chainsync.registerUser(telegramId, username, profileHash || '');
        
        if (result.success) {
            // Store in local database as well
            try {
                await req.database.query(`
                    INSERT OR REPLACE INTO users (telegram_id, username, wallet_address, profile_hash, created_at)
                    VALUES (?, ?, ?, ?, datetime('now'))
                `, [telegramId, username, walletData.address, profileHash || '']);
            } catch (dbError) {
                console.warn('Database storage failed:', dbError.message);
            }
        }
        
        res.json({
            success: result.success,
            data: {
                ...result,
                walletAddress: walletData.address
            },
            error: result.error
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register user on blockchain'
        });
    }
});

// Get user info from blockchain
router.get('/user/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const userInfo = await req.chainsync.getUserInfo(telegramId);
        
        if (!userInfo) {
            return res.status(404).json({
                success: false,
                error: 'User not found on blockchain'
            });
        }
        
        res.json({
            success: true,
            data: userInfo
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information'
        });
    }
});

// List product on blockchain
router.post('/products', async (req, res) => {
    try {
        const { telegramId, title, description, price, category, imageHash } = req.body;
        
        if (!telegramId || !title || !price) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID, title, and price are required'
            });
        }

        if (parseFloat(price) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Price must be greater than 0'
            });
        }

        const result = await req.chainsync.listProduct(
            telegramId,
            title,
            description || '',
            price,
            category || 'general',
            imageHash || ''
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error listing product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list product on blockchain'
        });
    }
});

// Get product from blockchain
router.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await req.chainsync.getProduct(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get product information'
        });
    }
});

// Get user's products
router.get('/users/:telegramId/products', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const products = await req.chainsync.getUserProducts(telegramId);
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error getting user products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user products'
        });
    }
});

// Purchase product
router.post('/purchase', async (req, res) => {
    try {
        const { buyerTelegramId, productId } = req.body;
        
        if (!buyerTelegramId || !productId) {
            return res.status(400).json({
                success: false,
                error: 'Buyer Telegram ID and product ID are required'
            });
        }

        // Check buyer balance first
        const balance = await req.walletManager.getBalance(buyerTelegramId);
        const product = await req.chainsync.getProduct(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (parseFloat(balance) < parseFloat(product.price)) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient balance'
            });
        }

        const result = await req.chainsync.purchaseProduct(buyerTelegramId, productId);
        
        res.json(result);
    } catch (error) {
        console.error('Error purchasing product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to purchase product'
        });
    }
});

// Get user's purchases
router.get('/users/:telegramId/purchases', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const purchases = await req.chainsync.getUserPurchases(telegramId);
        
        res.json({
            success: true,
            data: purchases
        });
    } catch (error) {
        console.error('Error getting user purchases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user purchases'
        });
    }
});

// Create social post
router.post('/social/posts', async (req, res) => {
    try {
        const { telegramId, productId, content } = req.body;
        
        if (!telegramId || !productId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID, product ID, and content are required'
            });
        }

        const result = await req.chainsync.createSocialPost(telegramId, productId, content);
        
        res.json(result);
    } catch (error) {
        console.error('Error creating social post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create social post'
        });
    }
});

// Like a post
router.post('/social/posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { telegramId } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID is required'
            });
        }

        const result = await req.chainsync.likePost(telegramId, postId);
        
        res.json(result);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like post'
        });
    }
});

// Follow user
router.post('/social/follow', async (req, res) => {
    try {
        const { followerTelegramId, followingTelegramId } = req.body;
        
        if (!followerTelegramId || !followingTelegramId) {
            return res.status(400).json({
                success: false,
                error: 'Both follower and following Telegram IDs are required'
            });
        }

        if (followerTelegramId === followingTelegramId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot follow yourself'
            });
        }

        const result = await req.chainsync.followUser(followerTelegramId, followingTelegramId);
        
        res.json(result);
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to follow user'
        });
    }
});

// Send payment via smart contract
router.post('/payments/send', async (req, res) => {
    try {
        const { senderTelegramId, recipientTelegramId, amount, message } = req.body;
        
        if (!senderTelegramId || !recipientTelegramId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Sender, recipient, and amount are required'
            });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0'
            });
        }

        const result = await req.chainsync.sendPayment(
            senderTelegramId,
            recipientTelegramId,
            amount,
            message || ''
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error sending payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send payment'
        });
    }
});

// Get marketplace statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await req.chainsync.getMarketplaceStats();
        const networkInfo = await req.walletManager.getNetworkInfo();
        const gasPrice = await req.chainsync.getGasPrice();
        
        res.json({
            success: true,
            data: {
                marketplace: stats,
                network: networkInfo,
                gasPrice: gasPrice + ' gwei',
                contracts: {
                    marketplace: process.env.MARKETPLACE_CONTRACT_ADDRESS,
                    payments: process.env.PAYMENTS_CONTRACT_ADDRESS
                }
            }
        });
    } catch (error) {
        console.error('Error getting blockchain stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get blockchain statistics'
        });
    }
});

// Estimate gas for transaction
router.post('/gas/estimate', async (req, res) => {
    try {
        const { telegramId, method, ...args } = req.body;
        
        if (!telegramId || !method) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID and method are required'
            });
        }

        const gasEstimate = await req.chainsync.estimateGas(telegramId, method, ...Object.values(args));
        
        res.json({
            success: true,
            data: {
                gasEstimate: gasEstimate,
                method: method
            }
        });
    } catch (error) {
        console.error('Error estimating gas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to estimate gas'
        });
    }
});

module.exports = router;