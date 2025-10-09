const { ethers } = require('ethers');
const WalletManager = require('./wallet-manager');

/**
 * ChainSync Blockchain Client
 * Handles all smart contract interactions for the marketplace
 */
class ChainSyncClient {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.PUSH_CHAIN_RPC_URL);
        this.walletManager = new WalletManager();
        
        // Contract addresses (will be set after deployment)
        this.marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
        this.paymentsAddress = process.env.PAYMENTS_CONTRACT_ADDRESS;
        
        // Contract ABIs (simplified - in production, import from artifacts)
        this.marketplaceABI = [
            "function registerUser(string telegramId, string username, string profileHash)",
            "function listProduct(string title, string description, uint256 price, string category, string imageHash)",
            "function purchaseProduct(uint256 productId) payable",
            "function createSocialPost(uint256 productId, string content)",
            "function likePost(uint256 postId)",
            "function followUser(address user)",
            "function rateProduct(uint256 purchaseId, uint8 rating, string review)",
            "function getWalletFromTelegram(string telegramId) view returns (address)",
            "function getUserProducts(address user) view returns (uint256[])",
            "function getUserPurchases(address user) view returns (uint256[])",
            "function products(uint256) view returns (uint256, address, string, string, uint256, string, string, bool, uint256, uint256, uint256, uint256)",
            "function users(address) view returns (address, string, string, string, uint256, uint256, uint256, bool, uint256)",
            "function purchases(uint256) view returns (uint256, uint256, address, address, uint256, uint256, bool, bool, uint8, string)",
            "function socialPosts(uint256) view returns (uint256, address, uint256, string, uint256, uint256, uint256, bool)",
            "event UserRegistered(address indexed wallet, string telegramId, string username, uint256 timestamp)",
            "event ProductListed(uint256 indexed productId, address indexed seller, string title, uint256 price, string category, uint256 timestamp)",
            "event ProductPurchased(uint256 indexed purchaseId, uint256 indexed productId, address indexed buyer, address seller, uint256 amount, uint256 timestamp)",
            "event SocialPostCreated(uint256 indexed postId, address indexed author, uint256 productId, string content, uint256 timestamp)"
        ];

        this.paymentsABI = [
            "function registerPhoneNumber(string phoneNumber)",
            "function sendPaymentToPhone(string recipientPhone, string message) payable",
            "function createGroupPayment(string[] participantPhones, string description) payable",
            "function settleGroupPayment(bytes32 groupId)",
            "function requestRefund(bytes32 paymentId, string reason)",
            "function getPhoneNumber(address user) view returns (string)",
            "function getAddressFromPhone(string phoneNumber) view returns (address)",
            "function getUserPayments(address user) view returns (bytes32[])",
            "function payments(bytes32) view returns (bytes32, address, address, uint256, string, uint256, bool, string, string, string)",
            "event PaymentSent(bytes32 indexed paymentId, address indexed sender, address indexed recipient, uint256 amount, string token, string senderPhone, string recipientPhone, string message, uint256 timestamp)"
        ];
    }

    /**
     * Get contract instance
     */
    getMarketplaceContract(telegramId = null) {
        if (!this.marketplaceAddress) {
            throw new Error('Marketplace contract not deployed');
        }

        if (telegramId) {
            const wallet = this.walletManager.getWallet(telegramId);
            return new ethers.Contract(this.marketplaceAddress, this.marketplaceABI, wallet);
        } else {
            return new ethers.Contract(this.marketplaceAddress, this.marketplaceABI, this.provider);
        }
    }

    getPaymentsContract(telegramId = null) {
        if (!this.paymentsAddress) {
            throw new Error('Payments contract not deployed');
        }

        if (telegramId) {
            const wallet = this.walletManager.getWallet(telegramId);
            return new ethers.Contract(this.paymentsAddress, this.paymentsABI, wallet);
        } else {
            return new ethers.Contract(this.paymentsAddress, this.paymentsABI, this.provider);
        }
    }

    /**
     * User Management
     */
    async registerUser(telegramId, username, profileHash = '') {
        try {
            const contract = this.getMarketplaceContract(telegramId);
            const tx = await contract.registerUser(telegramId, username, profileHash);
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash,
                walletAddress: this.walletManager.getAddress(telegramId)
            };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserInfo(telegramId) {
        try {
            const address = this.walletManager.getAddress(telegramId);
            const contract = this.getMarketplaceContract();
            const userInfo = await contract.users(address);
            
            return {
                wallet: userInfo[0],
                telegramId: userInfo[1],
                username: userInfo[2],
                profileHash: userInfo[3],
                totalPurchases: userInfo[4].toString(),
                totalSales: userInfo[5].toString(),
                reputation: userInfo[6].toString(),
                isVerified: userInfo[7],
                joinedAt: userInfo[8].toString()
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    /**
     * Product Management
     */
    async listProduct(telegramId, title, description, price, category, imageHash) {
        try {
            const contract = this.getMarketplaceContract(telegramId);
            const priceWei = ethers.parseEther(price.toString());
            
            const tx = await contract.listProduct(title, description, priceWei, category, imageHash);
            const receipt = await tx.wait();
            
            // Extract product ID from events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed.name === 'ProductListed';
                } catch (e) {
                    return false;
                }
            });
            
            const productId = event ? contract.interface.parseLog(event).args.productId : null;
            
            return {
                success: true,
                txHash: receipt.hash,
                productId: productId ? productId.toString() : null
            };
        } catch (error) {
            console.error('Error listing product:', error);
            return { success: false, error: error.message };
        }
    }

    async getProduct(productId) {
        try {
            const contract = this.getMarketplaceContract();
            const product = await contract.products(productId);
            
            return {
                id: product[0].toString(),
                seller: product[1],
                title: product[2],
                description: product[3],
                price: ethers.formatEther(product[4]),
                category: product[5],
                imageHash: product[6],
                isActive: product[7],
                createdAt: product[8].toString(),
                totalSales: product[9].toString(),
                totalRating: product[10].toString(),
                ratingCount: product[11].toString()
            };
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    async getUserProducts(telegramId) {
        try {
            const address = this.walletManager.getAddress(telegramId);
            const contract = this.getMarketplaceContract();
            const productIds = await contract.getUserProducts(address);
            
            const products = [];
            for (const id of productIds) {
                const product = await this.getProduct(id.toString());
                if (product) products.push(product);
            }
            
            return products;
        } catch (error) {
            console.error('Error getting user products:', error);
            return [];
        }
    }

    /**
     * Purchase Management
     */
    async purchaseProduct(buyerTelegramId, productId) {
        try {
            const product = await this.getProduct(productId);
            if (!product) throw new Error('Product not found');
            
            const contract = this.getMarketplaceContract(buyerTelegramId);
            const priceWei = ethers.parseEther(product.price);
            
            const tx = await contract.purchaseProduct(productId, { value: priceWei });
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash,
                amount: product.price
            };
        } catch (error) {
            console.error('Error purchasing product:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserPurchases(telegramId) {
        try {
            const address = this.walletManager.getAddress(telegramId);
            const contract = this.getMarketplaceContract();
            const purchaseIds = await contract.getUserPurchases(address);
            
            const purchases = [];
            for (const id of purchaseIds) {
                const purchase = await contract.purchases(id);
                const product = await this.getProduct(purchase[1].toString());
                
                purchases.push({
                    id: purchase[0].toString(),
                    productId: purchase[1].toString(),
                    buyer: purchase[2],
                    seller: purchase[3],
                    amount: ethers.formatEther(purchase[4]),
                    timestamp: purchase[5].toString(),
                    isDelivered: purchase[6],
                    isRefunded: purchase[7],
                    rating: purchase[8],
                    review: purchase[9],
                    product: product
                });
            }
            
            return purchases;
        } catch (error) {
            console.error('Error getting user purchases:', error);
            return [];
        }
    }

    /**
     * Social Features
     */
    async createSocialPost(telegramId, productId, content) {
        try {
            const contract = this.getMarketplaceContract(telegramId);
            const tx = await contract.createSocialPost(productId, content);
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error('Error creating social post:', error);
            return { success: false, error: error.message };
        }
    }

    async likePost(telegramId, postId) {
        try {
            const contract = this.getMarketplaceContract(telegramId);
            const tx = await contract.likePost(postId);
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error('Error liking post:', error);
            return { success: false, error: error.message };
        }
    }

    async followUser(followerTelegramId, followingTelegramId) {
        try {
            const followingAddress = this.walletManager.getAddress(followingTelegramId);
            const contract = this.getMarketplaceContract(followerTelegramId);
            const tx = await contract.followUser(followingAddress);
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error('Error following user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Payment Features (using UniversalPayments contract)
     */
    async sendPayment(senderTelegramId, recipientTelegramId, amount, message = '') {
        try {
            // Register phone numbers if not already registered
            await this.registerPhoneNumber(senderTelegramId, senderTelegramId);
            await this.registerPhoneNumber(recipientTelegramId, recipientTelegramId);
            
            const contract = this.getPaymentsContract(senderTelegramId);
            const amountWei = ethers.parseEther(amount.toString());
            
            const tx = await contract.sendPaymentToPhone(recipientTelegramId, message, { value: amountWei });
            const receipt = await tx.wait();
            
            return {
                success: true,
                txHash: receipt.hash,
                amount: amount
            };
        } catch (error) {
            console.error('Error sending payment:', error);
            return { success: false, error: error.message };
        }
    }

    async registerPhoneNumber(telegramId, phoneNumber) {
        try {
            const contract = this.getPaymentsContract(telegramId);
            const tx = await contract.registerPhoneNumber(phoneNumber);
            await tx.wait();
            return { success: true };
        } catch (error) {
            // Ignore if already registered
            return { success: true };
        }
    }

    /**
     * Analytics and Stats
     */
    async getMarketplaceStats() {
        try {
            // This would require additional view functions in the contract
            // For now, return mock data
            return {
                totalProducts: 0,
                totalUsers: 0,
                totalTransactions: 0,
                totalVolume: '0'
            };
        } catch (error) {
            console.error('Error getting marketplace stats:', error);
            return null;
        }
    }

    /**
     * Utility Functions
     */
    async getGasPrice() {
        try {
            const feeData = await this.provider.getFeeData();
            return ethers.formatUnits(feeData.gasPrice, 'gwei');
        } catch (error) {
            console.error('Error getting gas price:', error);
            return '0';
        }
    }

    async estimateGas(telegramId, contractMethod, ...args) {
        try {
            const wallet = this.walletManager.getWallet(telegramId);
            const contract = this.getMarketplaceContract(telegramId);
            
            const gasEstimate = await contract[contractMethod].estimateGas(...args);
            return gasEstimate.toString();
        } catch (error) {
            console.error('Error estimating gas:', error);
            return '0';
        }
    }
}

module.exports = ChainSyncClient;