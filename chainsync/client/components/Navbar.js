import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  Wallet,
  Bot,
  TrendingUp,
  MessageCircle,
  LogOut,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import chainSyncAPI from '../lib/chainsync-api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [balance, setBalance] = useState('0');

  const { 
    account, 
    isConnected, 
    isLoading, 
    connectWallet, 
    disconnect, 
    isOnPushChain,
    switchToPushChain,
    getBalance
  } = useWeb3();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      updateBalance();
    }
  }, [isConnected, account]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWalletDropdown && !event.target.closest('.wallet-dropdown-container')) {
        setShowWalletDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWalletDropdown]);

  const updateBalance = async () => {
    if (account) {
      try {
        const bal = await getBalance(account);
        setBalance(bal);
      } catch (error) {
        console.error('Error getting balance:', error);
      }
    }
  };

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot', '_blank');
  };

  const handleWalletConnect = async () => {
    if (isConnected) {
      setShowWalletDropdown(!showWalletDropdown);
    } else {
      await connectWallet();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletDropdown(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-gray-900/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </motion.div>
            <span className={`text-xl font-bold transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white'
            } group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400`}>
              ChainSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className={`font-medium transition-all duration-200 hover:scale-105 ${
              scrolled 
                ? 'text-gray-700 hover:text-purple-600' 
                : 'text-gray-300 hover:text-white'
            }`}>
              Marketplace
            </Link>
            <Link href="/sell" className={`font-medium transition-all duration-200 hover:scale-105 ${
              scrolled 
                ? 'text-gray-700 hover:text-purple-600' 
                : 'text-gray-300 hover:text-white'
            }`}>
              Sell
            </Link>
            <Link href="/social" className={`font-medium transition-all duration-200 hover:scale-105 ${
              scrolled 
                ? 'text-gray-700 hover:text-purple-600' 
                : 'text-gray-300 hover:text-white'
            }`}>
              Social
            </Link>
            <Link href="/analytics" className={`font-medium transition-all duration-200 hover:scale-105 ${
              scrolled 
                ? 'text-gray-700 hover:text-purple-600' 
                : 'text-gray-300 hover:text-white'
            }`}>
              Analytics
            </Link>
            
            {/* PushPay Bot Button */}
            <motion.button
              onClick={handleBotClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Bot className="w-4 h-4 mr-2" />
              PushPay Bot
            </motion.button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {/* Wallet Button */}
            <div className="relative wallet-dropdown-container">
              <motion.button 
                onClick={handleWalletConnect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 font-medium transition-all duration-200 rounded-lg ${
                  isConnected
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : scrolled 
                      ? 'text-gray-700 hover:text-purple-600 hover:bg-purple-50' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{formatAddress(account)}</span>
                    <span className="lg:hidden">Connected</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                  </>
                )}
              </motion.button>

              {/* Wallet Dropdown */}
              <AnimatePresence>
                {showWalletDropdown && isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Wallet</span>
                        {isOnPushChain() ? (
                          <span className="flex items-center text-xs text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Push Chain
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-red-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Wrong Network
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{formatAddress(account)}</div>
                      <div className="text-sm font-semibold text-gray-900 mt-2">
                        {formatBalance(balance)} PC
                      </div>
                    </div>
                    
                    {!isOnPushChain() && (
                      <button
                        onClick={switchToPushChain}
                        className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        Switch to Push Chain
                      </button>
                    )}
                    
                    <button
                      onClick={updateBalance}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Refresh Balance
                    </button>
                    
                    <Link
                      href="/profile"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowWalletDropdown(false)}
                    >
                      View Profile
                    </Link>
                    
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Link */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/profile" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              <Link 
                href="/marketplace" 
                className="flex items-center space-x-3 text-gray-700 hover:text-push-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Marketplace</span>
              </Link>
              
              <Link 
                href="/sell" 
                className="flex items-center space-x-3 text-gray-700 hover:text-push-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Sell</span>
              </Link>
              
              <Link 
                href="/social" 
                className="flex items-center space-x-3 text-gray-700 hover:text-push-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Social</span>
              </Link>
              
              <Link 
                href="/analytics" 
                className="flex items-center space-x-3 text-gray-700 hover:text-push-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </Link>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => {
                    handleBotClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  <Bot className="w-5 h-5" />
                  <span>Try PushPay Bot</span>
                </button>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                  className={`flex items-center space-x-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    isConnected
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnected ? <CheckCircle className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  <span>
                    {isConnected 
                      ? `Connected: ${formatAddress(account)}` 
                      : isLoading 
                        ? 'Connecting...' 
                        : 'Connect Wallet'
                    }
                  </span>
                </button>
                
                {isConnected && (
                  <button 
                    onClick={handleDisconnect}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Disconnect</span>
                  </button>
                )}
                
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}