import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  User, 
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import chainSyncAPI from '../lib/chainsync-api';

export default function SendMoney({ telegramUser, onSuccess }) {
  const [step, setStep] = useState('search'); // search, confirm, sending, success
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [txResult, setTxResult] = useState(null);

  // Load balance
  useEffect(() => {
    if (telegramUser?.id) {
      loadBalance();
    }
  }, [telegramUser]);

  const loadBalance = async () => {
    try {
      const result = await chainSyncAPI.getBalance(telegramUser.id);
      if (result.success) {
        setBalance(result.data.balance);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Select recipient
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setStep('confirm');
  };

  // Send money
  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setStep('sending');
    setLoading(true);

    try {
      const result = await chainSyncAPI.sendTokens(
        telegramUser.id,
        selectedUser.telegramId,
        amount,
        message
      );

      if (result.success) {
        setTxResult(result.data);
        setStep('success');
        toast.success('Money sent successfully!');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error(error.message || 'Failed to send money');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setAmount('');
    setMessage('');
    setTxResult(null);
    loadBalance();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Send Money</h3>
        {step !== 'search' && (
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Search for recipient */}
        {step === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by username, phone, or address..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.telegramId}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.displayName}</div>
                      {user.username && (
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No users found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Confirm transaction */}
        {step === 'confirm' && selectedUser && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Recipient */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                Sending to
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUser.displayName}</div>
                  {selectedUser.username && (
                    <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
              />
              <div className="mt-1 text-sm text-gray-500">
                Available: {chainSyncAPI.formatBalance(balance)} PC
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's this for?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send {amount || '0'} PC</span>
            </button>
          </motion.div>
        )}

        {/* Step 3: Sending */}
        {step === 'sending' && (
          <motion.div
            key="sending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Sending Money...
            </h4>
            <p className="text-gray-600">
              Please wait while we process your transaction
            </p>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && txResult && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Money Sent Successfully!
            </h4>
            <p className="text-gray-600 mb-4">
              {amount} PC sent to {selectedUser.displayName}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <div className="text-xs font-medium text-gray-500 mb-1">Transaction Hash</div>
              <code className="text-xs font-mono text-gray-700 break-all">
                {txResult.txHash}
              </code>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Send More Money
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}