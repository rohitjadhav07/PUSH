import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ChainSyncAPI {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Wallet Management
    async generateWallet(telegramId) {
        const response = await this.client.post('/api/wallet/generate', { telegramId });
        return response.data;
    }

    async getBalance(telegramId) {
        const response = await this.client.get(`/api/wallet/balance/${telegramId}`);
        return response.data;
    }

    async sendTokens(fromTelegramId, toTelegramId, amount, message = '') {
        const response = await this.client.post('/api/wallet/send', {
            fromTelegramId,
            toTelegramId,
            amount,
            message
        });
        return response.data;
    }

    async requestFaucet(telegramId) {
        const response = await this.client.post('/api/wallet/faucet', { telegramId });
        return response.data;
    }

    async getTransactionHistory(telegramId, limit = 10) {
        const response = await this.client.get(`/api/wallet/history/${telegramId}?limit=${limit}`);
        return response.data;
    }

    async exportWallet(telegramId, password) {
        const response = await this.client.post('/api/wallet/export', { telegramId, password });
        return response.data;
    }

    async getNetworkInfo() {
        const response = await this.client.get('/api/wallet/network');
        return response.data;
    }

    // Blockchain Operations
    async registerUser(telegramId, username, profileHash = '') {
        const response = await this.client.post('/api/blockchain/register', {
            telegramId,
            username,
            profileHash
        });
        return response.data;
    }

    async getUserInfo(telegramId) {
        const response = await this.client.get(`/api/blockchain/user/${telegramId}`);
        return response.data;
    }

    async listProduct(telegramId, title, description, price, category, imageHash = '') {
        const response = await this.client.post('/api/blockchain/products', {
            telegramId,
            title,
            description,
            price,
            category,
            imageHash
        });
        return response.data;
    }

    async getProduct(productId) {
        const response = await this.client.get(`/api/blockchain/products/${productId}`);
        return response.data;
    }

    async getUserProducts(telegramId) {
        const response = await this.client.get(`/api/blockchain/users/${telegramId}/products`);
        return response.data;
    }

    async purchaseProduct(buyerTelegramId, productId) {
        const response = await this.client.post('/api/blockchain/purchase', {
            buyerTelegramId,
            productId
        });
        return response.data;
    }

    async getUserPurchases(telegramId) {
        const response = await this.client.get(`/api/blockchain/users/${telegramId}/purchases`);
        return response.data;
    }

    // Social Features
    async createSocialPost(telegramId, productId, content) {
        const response = await this.client.post('/api/blockchain/social/posts', {
            telegramId,
            productId,
            content
        });
        return response.data;
    }

    async likePost(telegramId, postId) {
        const response = await this.client.post(`/api/blockchain/social/posts/${postId}/like`, {
            telegramId
        });
        return response.data;
    }

    async followUser(followerTelegramId, followingTelegramId) {
        const response = await this.client.post('/api/blockchain/social/follow', {
            followerTelegramId,
            followingTelegramId
        });
        return response.data;
    }

    // Payments
    async sendPayment(senderTelegramId, recipientTelegramId, amount, message = '') {
        const response = await this.client.post('/api/blockchain/payments/send', {
            senderTelegramId,
            recipientTelegramId,
            amount,
            message
        });
        return response.data;
    }

    // Analytics
    async getBlockchainStats() {
        const response = await this.client.get('/api/blockchain/stats');
        return response.data;
    }

    async estimateGas(telegramId, method, ...args) {
        const response = await this.client.post('/api/blockchain/gas/estimate', {
            telegramId,
            method,
            ...args
        });
        return response.data;
    }

    // Traditional API endpoints (for demo data)
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await this.client.get(`/api/products?${params}`);
        return response.data;
    }

    async getUsers() {
        const response = await this.client.get('/api/users');
        return response.data;
    }

    async getAnalytics() {
        const response = await this.client.get('/api/analytics');
        return response.data;
    }

    async getSocialPosts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await this.client.get(`/api/social?${params}`);
        return response.data;
    }

    // Health check
    async getHealth() {
        const response = await this.client.get('/health');
        return response.data;
    }

    // Utility methods
    formatError(error) {
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        return error.message || 'An unexpected error occurred';
    }

    isValidTelegramId(telegramId) {
        return /^\d+$/.test(telegramId) && telegramId.length >= 5;
    }

    formatBalance(balance) {
        const num = parseFloat(balance);
        if (num === 0) return '0';
        if (num < 0.001) return '< 0.001';
        if (num < 1) return num.toFixed(4);
        if (num < 1000) return num.toFixed(2);
        return num.toLocaleString();
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    generateQRData(address) {
        return `ethereum:${address}`;
    }
}

// Create singleton instance
const chainSyncAPI = new ChainSyncAPI();

export default chainSyncAPI;