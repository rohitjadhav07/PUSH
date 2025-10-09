import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    Copy, 
    ExternalLink, 
    RefreshCw, 
    AlertCircle,
    CheckCircle,
    Zap,
    QrCode,
    Download
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import chainSyncAPI from '../lib/chainsync-api';

export default function WalletConnect({ telegramId, onWalletConnected }) {
    const { 
        account, 
        isConnected, 
        isLoading, 
        error, 
        connectWallet, 
        disconnect, 
        getBalance,
        isOnPushChain,
        switchToPushChain
    } = useWeb3();

    const [walletData, setWalletData] = useState(null);
    const [balance, setBalance] = useState('0');
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generate ChainSync wallet from Telegram ID
    useEffect(() => {
        if (telegramId) {
            generateChainSyncWallet();
        }
    }, [telegramId]);

    // Update balance when connected
    useEffect(() => {
        if (isConnected && account) {
            updateBalance();
            onWalletConnected?.(account);
        }
    }, [isConnected, account]);

    const generateChainSyncWallet = async () => {
        try {
            const result = await chainSyncAPI.generateWallet(telegramId);
            if (result.success) {
                setWalletData(result.data);
                updateChainSyncBalance();
            }
        } catch (error) {
            console.error('Error generating wallet:', error);
        }
    };

    const updateBalance = async () => {
        if (!account) return;
        
        setIsLoadingBalance(true);
        try {
            const balance = await getBalance(account);
            setBalance(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const updateChainSyncBalance = async () => {
        if (!telegramId) return;
        
        try {
            const result = await chainSyncAPI.getBalance(telegramId);
            if (result.success) {
                setBalance(result.data.balance);
            }
        } catch (error) {
            console.error('Error getting ChainSync balance:', error);
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleFaucet = async () => {
        if (!telegramId) return;
        
        try {
            const result = await chainSyncAPI.requestFaucet(telegramId);
            if (result.success) {
                updateChainSyncBalance();
                // Show success message
            }
        } catch (error) {
            console.error('Faucet request failed:', error);
        }
    };

    const ConnectedWallet = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                        <p className="text-sm text-gray-500">
                            {isOnPushChain() ? 'Push Chain Testnet' : 'Wrong Network'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={disconnect}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>

            {!isOnPushChain() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                            Please switch to Push Chain Testnet
                        </span>
                    </div>
                    <button
                        onClick={switchToPushChain}
                        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                    >
                        Switch Network
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono">
                            {chainSyncAPI.formatAddress(account)}
                        </code>
                        <button
                            onClick={() => handleCopy(account)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Balance</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                            {isLoadingBalance ? (
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                                `${chainSyncAPI.formatBalance(balance)} PC`
                            )}
                        </span>
                        <button
                            onClick={updateBalance}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const ChainSyncWallet = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
        >
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">ChainSync Wallet</h3>
                    <p className="text-sm text-gray-500">Generated from Telegram ID</p>
                </div>
            </div>

            {walletData && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono border">
                                {chainSyncAPI.formatAddress(walletData.address)}
                            </code>
                            <button
                                onClick={() => handleCopy(walletData.address)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Balance</label>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-2xl font-bold text-purple-600">
                                {chainSyncAPI.formatBalance(balance)} PC
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={updateChainSyncBalance}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleFaucet}
                                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                >
                                    <Zap className="w-3 h-3" />
                                    <span>Faucet</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showQR && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white rounded-lg p-4 border"
                            >
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <QrCode className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500">QR Code for wallet address</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );

    const ConnectButton = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                    Connect your MetaMask wallet to interact with ChainSync on Push Chain
                </p>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Wallet className="w-5 h-5" />
                            <span>Connect MetaMask</span>
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* MetaMask Connection */}
            {isConnected ? <ConnectedWallet /> : <ConnectButton />}
            
            {/* ChainSync Wallet (always show if telegramId exists) */}
            {telegramId && <ChainSyncWallet />}
        </div>
    );
}