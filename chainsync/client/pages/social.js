import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  TrendingUp,
  Users,
  Star,
  Eye,
  Bot,
  Zap,
  Globe,
  ShoppingBag,
  Award,
  Check,
  TrendingUp as Fire,
  Search,
  UserPlus,
  Settings
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TelegramUserSearch from '../components/TelegramUserSearch';
import TelegramAuth from '../components/TelegramAuth';

export default function Social() {
  const [activeTab, setActiveTab] = useState('trending');
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Mock social data
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        user: {
          name: "CryptoArtist",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          verified: true,
          chain: "ethereum"
        },
        type: "purchase",
        product: {
          name: "Digital Masterpiece #001",
          image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=300",
          price: 0.5,
          currency: "ETH"
        },
        message: "Just bought this incredible NFT! The cross-chain payment was seamless 🚀",
        timestamp: "2 hours ago",
        engagement: {
          likes: 234,
          shares: 45,
          comments: 12,
          views: 1200
        },
        trending: true
      },
      {
        id: 2,
        user: {
          name: "Web3Builder",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          verified: false,
          chain: "push"
        },
        type: "sale",
        product: {
          name: "Smart Contract Course",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
          price: 2.5,
          currency: "PC"
        },
        message: "Excited to share my new course! Built specifically for Push Chain developers 💜",
        timestamp: "4 hours ago",
        engagement: {
          likes: 567,
          shares: 89,
          comments: 34,
          views: 3400
        },
        trending: true
      },
      {
        id: 3,
        user: {
          name: "GameFiPro",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          verified: true,
          chain: "solana"
        },
        type: "review",
        product: {
          name: "Gaming Assets Bundle",
          image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300",
          price: 15,
          currency: "SOL"
        },
        message: "Amazing gaming assets! Used PushPay Bot for instant payment - so convenient! ⚡",
        timestamp: "6 hours ago",
        engagement: {
          likes: 892,
          shares: 156,
          comments: 67,
          views: 5600
        },
        rating: 5,
        trending: false
      }
    ];

    setTimeout(() => {
      setSocialPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  // Handle Telegram authentication
  const handleTelegramAuth = (user) => {
    setTelegramUser(user);
    toast.success(`Welcome ${user.firstName}! You can now search for friends.`);
  };

  // Handle user selection from search
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    toast.success(`Viewing ${user.firstName}'s profile`);
  };

  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setSocialPosts(posts => 
        posts.map(post => 
          post.id === postId 
            ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes + 1 } }
            : post
        )
      );
      
      // Here you would call the API
      // await chainSyncAPI.likePost(userTelegramId, postId);
      
      // Show success feedback
      const post = socialPosts.find(p => p.id === postId);
      if (post) {
        toast.success(`Liked ${post.user.name}'s post!`);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
      
      // Revert optimistic update
      setSocialPosts(posts => 
        posts.map(post => 
          post.id === postId 
            ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes - 1 } }
            : post
        )
      );
    }
  };

  const handleShare = async (postId) => {
    try {
      const post = socialPosts.find(p => p.id === postId);
      if (!post) return;
      
      const shareText = `Check out this amazing product: "${post.product.name}" on ChainSync! 🚀`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'ChainSync Social Commerce',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Post copied to clipboard!');
      }
      
      // Update share count
      setSocialPosts(posts => 
        posts.map(p => 
          p.id === postId 
            ? { ...p, engagement: { ...p.engagement, shares: p.engagement.shares + 1 } }
            : p
        )
      );
      
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    }
  };

  const getChainIcon = (chain) => {
    const icons = {
      ethereum: '⟠',
      push: '🚀',
      solana: '◎',
      polygon: '⬟'
    };
    return icons[chain] || '🌐';
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'purchase': return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case 'sale': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Head>
        <title>Social Commerce - ChainSync</title>
        <meta name="description" content="Discover, share, and engage with the universal commerce community" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 pb-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.8, 1],
                x: [0, -30, 0],
                y: [0, 20, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                <Users className="w-4 h-4 mr-2" />
                Join the Social Commerce Revolution
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Social </span>
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Commerce
                </motion.span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                Discover products through your network. Share purchases, get social proof, 
                and build your reputation in the universal commerce ecosystem.
              </p>
              
              {/* Social Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                {[
                  { number: "10K+", label: "Active Users", icon: Users },
                  { number: "50K+", label: "Social Posts", icon: MessageCircle },
                  { number: "2.5M", label: "Engagements", icon: Heart },
                  { number: "95%", label: "Satisfaction", icon: Star }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm text-purple-200">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* PushPay Bot Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-6 h-6" />
                <span className="font-medium">
                  💬 Share your purchases instantly with PushPay Bot integration!
                </span>
              </div>
              <button
                onClick={handleBotClick}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                Try Bot →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Telegram Authentication */}
                <TelegramAuth 
                  onAuthSuccess={handleTelegramAuth}
                  onAuthError={(error) => toast.error('Failed to connect to Telegram')}
                />

                {/* User Search - Only show if authenticated */}
                {telegramUser && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Find Friends</h3>
                      <button
                        onClick={() => setShowUserSearch(!showUserSearch)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <TelegramUserSearch 
                      onUserSelect={handleUserSelect}
                      className="mb-4"
                    />
                    
                    {selectedUser && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={selectedUser.avatar}
                            alt={selectedUser.firstName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedUser.firstName} {selectedUser.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{selectedUser.telegramId}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-green-600">
                              {selectedUser.chainSyncProfile.totalPurchases}
                            </div>
                            <div className="text-gray-600">Purchases</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-blue-600">
                              {selectedUser.chainSyncProfile.totalSales}
                            </div>
                            <div className="text-gray-600">Sales</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => window.open(`https://t.me/${selectedUser.username}`, '_blank')}
                            className="flex-1 bg-blue-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Message</span>
                          </button>
                          <button
                            onClick={() => toast.success(`Added ${selectedUser.firstName} as friend!`)}
                            className="flex-1 bg-purple-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Explore</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'trending', label: 'Trending', icon: Fire, color: 'text-red-500' },
                      { id: 'following', label: 'Following', icon: Users, color: 'text-blue-500' },
                      { id: 'purchases', label: 'Purchases', icon: ShoppingBag, color: 'text-green-500' },
                      { id: 'reviews', label: 'Reviews', icon: Star, color: 'text-yellow-500' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Influencers */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Top Influencers</h3>
                  <div className="space-y-4">
                    {[
                      { name: "CryptoQueen", followers: "12.5K", chain: "ethereum", verified: true },
                      { name: "NFTCollector", followers: "8.9K", chain: "solana", verified: true },
                      { name: "DeFiGuru", followers: "15.2K", chain: "push", verified: true }
                    ].map((influencer, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {influencer.name.charAt(0)}
                            </span>
                          </div>
                          {influencer.verified && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{influencer.name}</span>
                            <span className="text-xs">{getChainIcon(influencer.chain)}</span>
                          </div>
                          <div className="text-xs text-gray-500">{influencer.followers} followers</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                        <div className="flex space-x-4">
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {socialPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={post.user.avatar}
                                alt={post.user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {post.user.verified && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Award className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{post.user.name}</span>
                                <span className="text-sm">{getChainIcon(post.user.chain)}</span>
                                {getPostTypeIcon(post.type)}
                              </div>
                              <div className="text-sm text-gray-500">{post.timestamp}</div>
                            </div>
                          </div>
                          {post.trending && (
                            <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                              <Fire className="w-3 h-3" />
                              <span>Trending</span>
                            </div>
                          )}
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-800 mb-4">{post.message}</p>

                        {/* Product Card */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={post.product.image}
                              alt={post.product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{post.product.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-lg font-bold text-purple-600">
                                  {post.product.price} {post.product.currency}
                                </span>
                                {post.rating && (
                                  <div className="flex items-center space-x-1">
                                    {[...Array(post.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Engagement */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-6">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLike(post.id)}
                              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Heart className="w-5 h-5" />
                              <span className="text-sm font-medium">{post.engagement.likes}</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleShare(post.id)}
                              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                            >
                              <Share2 className="w-5 h-5" />
                              <span className="text-sm font-medium">{post.engagement.shares}</span>
                            </motion.button>
                            
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{post.engagement.comments}</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{post.engagement.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}