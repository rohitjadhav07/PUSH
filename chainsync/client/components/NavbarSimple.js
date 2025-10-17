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
  Copy,
  CheckCircle
} from 'lucide-react';
import chainSyncAPI from '../lib/chainsync-api';

export default function NavbarSimple() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [balance, setBalance] = useState('0');
  const [copied, setCopied] = useState(false);

  // Get Telegram user
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        setTelegramUser(user);
        // Generate wallet for this user
        generateWallet(user.id);
      }
    }
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate ChainSync wallet
  const generateWallet = async (telegramId) => {
    try {
      const result = await chainSyncAPI.generateWallet(telegramId);
      if (result.success) {
        setWalletData(result.data);
        updateBalance(telegramId);
      }
    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  // Update balance
  const updateBalance = async (telegramId) => {
    try {
      const result = await chainSyncAPI.getBalance(telegramId);
      if (result.success) {
        setBalance(result.data.balance);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  // Copy address
  const handleCopy = async () => {
    if (walletData?.address) {
      try {
        await navigator.clipboard.writeText(walletData.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: ShoppingBag },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/social', label: 'Social', icon: MessageCircle },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                ChainSync
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 transition-colors ${
                  scrolled 
                    ? 'text-gray-700 hover:text-purple-600' 
                    : 'text-white hover:text-purple-300'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet & User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* PushPay Bot Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">PushPay Bot</span>
            </motion.button>

            {/* Wallet Display */}
            {walletData ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    scrolled
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {chainSyncAPI.formatBalance(balance)} PC
                  </span>
                </button>

                <AnimatePresence>
                  {showWalletDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
                    >
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Your Wallet</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="flex-1 text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                              {chainSyncAPI.formatAddress(walletData.address)}
                            </code>
                            <button
                              onClick={handleCopy}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500">Balance</label>
                          <div className="text-2xl font-bold text-purple-600 mt-1">
                            {chainSyncAPI.formatBalance(balance)} PC
                          </div>
                        </div>

                        {telegramUser && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {telegramUser.first_name} {telegramUser.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  @{telegramUser.username}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <Link
                          href="/profile"
                          className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/profile"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  scrolled
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              
              <button
                onClick={() => {
                  window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
              >
                <Bot className="w-5 h-5" />
                <span>PushPay Bot</span>
              </button>

              {walletData && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-2">Your Wallet</div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      {chainSyncAPI.formatBalance(balance)} PC
                    </div>
                    <code className="text-xs font-mono text-gray-600">
                      {chainSyncAPI.formatAddress(walletData.address)}
                    </code>
                  </div>
                </div>
              )}

              <Link
                href="/profile"
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}