import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  User, 
  Shield, 
  Zap, 
  Check, 
  X,
  Bot,
  Smartphone,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import telegramWebApp from '../lib/telegramWebApp';

export default function TelegramAuth({ onAuthSuccess, onAuthError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState('initial'); // initial, connecting, verifying, success
  const [telegramUser, setTelegramUser] = useState(null);

  // Initialize Telegram Web App
  useEffect(() => {
    const initTelegram = async () => {
      try {
        await telegramWebApp.init();
        
        // Check if user is already authenticated
        if (telegramWebApp.isInTelegram()) {
          const user = telegramWebApp.getUser();
          if (user) {
            // Auto-authenticate if we have valid user data
            handleAutoAuth(user);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Telegram Web App:', error);
      }
    };

    initTelegram();
  }, []);

  // Handle automatic authentication for returning users
  const handleAutoAuth = async (user) => {
    try {
      setAuthStep('verifying');
      
      // Validate with server
      const validatedUser = await telegramWebApp.validateAuth();
      
      setTelegramUser(validatedUser);
      setAuthStep('success');
      
      if (onAuthSuccess) {
        onAuthSuccess(validatedUser);
      }
      
      toast.success(`Welcome back, ${validatedUser.firstName}!`);
    } catch (error) {
      console.error('Auto-auth failed:', error);
      setAuthStep('initial');
    }
  };

  // Real Telegram authentication process
  const handleTelegramLogin = async () => {
    setIsLoading(true);
    setAuthStep('connecting');
    
    try {
      // Check if running in Telegram Web App
      if (telegramWebApp.isInTelegram()) {
        setAuthStep('verifying');
        
        // Use the real authentication method
        const user = await telegramWebApp.login();
        
        setTelegramUser(user);
        setAuthStep('success');
        
        if (onAuthSuccess) {
          onAuthSuccess(user);
        }
        
        toast.success('Successfully connected to Telegram!');
        
        // Haptic feedback for success
        telegramWebApp.hapticFeedback('notification', 'success');
        
      } else {
        // Not in Telegram Web App - show instructions
        setAuthStep('not-in-telegram');
        toast.error('Please open this page in Telegram Web App');
      }
      
    } catch (error) {
      console.error('Telegram auth error:', error);
      setAuthStep('initial');
      
      if (onAuthError) {
        onAuthError(error);
      }
      
      toast.error(error.message || 'Failed to connect to Telegram');
      
      // Haptic feedback for error
      telegramWebApp.hapticFeedback('notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    telegramWebApp.logout();
    setTelegramUser(null);
    setAuthStep('initial');
    toast.success('Logged out successfully');
    
    // Haptic feedback
    telegramWebApp.hapticFeedback('impact', 'light');
  };

  // Render different states
  const renderAuthContent = () => {
    switch (authStep) {
      case 'connecting':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connecting to Telegram...
            </h3>
            <p className="text-gray-600">
              Please wait while we establish a secure connection
            </p>
          </motion.div>
        );

      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verifying Identity...
            </h3>
            <p className="text-gray-600">
              Confirming your Telegram account details
            </p>
          </motion.div>
        );

      case 'not-in-telegram':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Open in Telegram
            </h3>
            <p className="text-gray-600 mb-4">
              This feature requires Telegram Web App. Please open ChainSync through:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.open('https://t.me/PushAuthBot/ChainSyncSocial', '_blank')}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Open via @PushAuthBot
              </button>
              <button
                onClick={() => setAuthStep('initial')}
                className="w-full text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome, {telegramUser?.firstName}!
            </h3>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              {telegramUser?.photoUrl && (
                <img
                  src={telegramUser.photoUrl}
                  alt={telegramUser.firstName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  {telegramUser?.firstName} {telegramUser?.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  @{telegramUser?.username}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-blue-600 font-medium">Connected</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-green-600 font-medium">Verified</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Disconnect Account
            </button>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect with Telegram
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Link your Telegram account to access social features, find friends, and use @PushAuthBot
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4 text-green-500" />
                <span>Find Friends</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>@PushAuthBot</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Instant Payments</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Secure Login</span>
              </div>
            </div>
            
            <button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Connect Telegram Account</span>
              </div>
            </button>
            
            <div className="mt-4 text-xs text-gray-500">
              <Lock className="w-3 h-3 inline mr-1" />
              Your data is encrypted and secure
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {renderAuthContent()}
      
      {/* Features List */}
      {authStep === 'initial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            What you get with Telegram integration:
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Search and connect with friends</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Use @PushAuthBot for payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Share purchases and reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Get notifications and updates</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Bot Integration */}
      {authStep === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              @PushAuthBot Integration
            </h4>
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              <span>Active</span>
            </div>
          </div>
          
          <button
            onClick={() => window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/PushAuthBot', '_blank')}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
          >
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">Open @PushAuthBot</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}