import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User, 
  Phone, 
  MessageCircle, 
  UserPlus, 
  Users,
  X,
  Check,
  Star,
  Bot,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TelegramUserSearch({ onUserSelect, className = "" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // Mock user data - In real app, this would come from Telegram API
  const mockUsers = [
    {
      id: 1,
      telegramId: '@cryptoartist',
      username: 'cryptoartist',
      firstName: 'Alex',
      lastName: 'Johnson',
      phoneNumber: '+1234567890',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isVerified: true,
      isOnline: true,
      lastSeen: 'online',
      mutualFriends: 12,
      chainSyncProfile: {
        totalPurchases: 45,
        totalSales: 23,
        rating: 4.8,
        joinedDate: '2023-01-15'
      }
    },
    {
      id: 2,
      telegramId: '@web3builder',
      username: 'web3builder',
      firstName: 'Sarah',
      lastName: 'Chen',
      phoneNumber: '+1987654321',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isVerified: false,
      isOnline: false,
      lastSeen: '2 hours ago',
      mutualFriends: 8,
      chainSyncProfile: {
        totalPurchases: 67,
        totalSales: 34,
        rating: 4.9,
        joinedDate: '2023-03-22'
      }
    },
    {
      id: 3,
      telegramId: '@nftcollector',
      username: 'nftcollector',
      firstName: 'Mike',
      lastName: 'Rodriguez',
      phoneNumber: '+1555123456',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isVerified: true,
      isOnline: true,
      lastSeen: 'online',
      mutualFriends: 25,
      chainSyncProfile: {
        totalPurchases: 123,
        totalSales: 89,
        rating: 4.7,
        joinedDate: '2022-11-08'
      }
    }
  ];

  // Search function
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/telegram/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          telegramData: window.Telegram?.WebApp?.initData || '',
          searchType: 'all'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
      } else {
        console.error('Search error:', data.error);
        toast.error('Search failed. Please try again.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search API error:', error);
      toast.error('Search failed. Please try again.');
      
      // Fallback to mock data for demo
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.telegramId.toLowerCase().includes(query.toLowerCase()) ||
        user.phoneNumber.includes(query.replace(/\D/g, ''))
      );
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle user selection
  const handleUserSelect = (user) => {
    // Add to recent searches
    const updatedRecent = [user, ...recentSearches.filter(u => u.id !== user.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    
    // Call parent callback
    if (onUserSelect) {
      onUserSelect(user);
    }
    
    // Close search
    setIsOpen(false);
    setSearchQuery('');
    
    toast.success(`Selected ${user.firstName} ${user.lastName}`);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by username, phone, or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden"
          >
            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.telegramId}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
                    />
                    <p className="text-gray-500">Searching users...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((user) => (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-left group"
                      >
                        {/* Avatar with Status */}
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {user.isVerified && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.isVerified && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-1">{user.telegramId}</div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {user.mutualFriends} mutual
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-400" />
                              {user.chainSyncProfile.rating}
                            </span>
                            <span className={`flex items-center ${user.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                              <div className={`w-2 h-2 rounded-full mr-1 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              {user.lastSeen}
                            </span>
                          </div>
                        </div>

                        {/* ChainSync Stats */}
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">ChainSync</div>
                          <div className="text-xs space-y-1">
                            <div className="text-green-600">
                              {user.chainSyncProfile.totalPurchases} purchases
                            </div>
                            <div className="text-blue-600">
                              {user.chainSyncProfile.totalSales} sales
                            </div>
                          </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://t.me/${user.username}`, '_blank');
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Message on Telegram"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add friend functionality
                              toast.success(`Friend request sent to ${user.firstName}`);
                            }}
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Add Friend"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No users found</p>
                    <p className="text-xs text-gray-400">
                      Try searching by username, phone number, or name
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {!searchQuery && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quick Actions</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open('https://t.me/PushPayCryptoBot', '_blank')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Bot className="w-3 h-3" />
                      <span>PushPay Bot</span>
                    </button>
                    <button
                      onClick={() => {
                        // Invite friends functionality
                        toast.success('Invite link copied!');
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}