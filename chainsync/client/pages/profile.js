import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Settings, 
  History, 
  Heart,
  Share2,
  ShoppingBag,
  TrendingUp,
  Bot,
  Bell,
  Shield,
  Edit3,
  Copy,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data
  useEffect(() => {
    setTimeout(() => {
      setUser({
        id: 1,
        address: '0x079b15a064c1cD07252CD9FCB1de5561D8D56992',
        username: 'crypto_enthusiast',
        displayName: 'Crypto Enthusiast',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Passionate about universal commerce and cross-chain payments. Building the future of Web3.',
        joinedDate: '2025-01-15',
        stats: {
          totalPurchases: 12,
          totalSales: 8,
          totalSpent: 45.6,
          totalEarned: 32.4,
          followers: 234,
          following: 89
        },
        preferences: {
          preferredChain: 'push',
          notifications: true,
          publicProfile: true,
          showTransactions: false
        },
        recentActivity: [
          {
            id: 1,
            type: 'purchase',
            title: 'Digital Art NFT Collection',
            amount: 0.5,
            currency: 'ETH',
            date: '2025-01-20T10:30:00Z'
          },
          {
            id: 2,
            type: 'sale',
            title: 'Web3 Course Bundle',
            amount: 2.5,
            currency: 'PC',
            date: '2025-01-19T14:15:00Z'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      // You could add a toast notification here
    }
  };

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Profile - ChainSync</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-20 flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-push-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - ChainSync</title>
        <meta name="description" content="Your ChainSync profile - manage your universal commerce account" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Profile Header */}
        <section className="pt-20 pb-8 bg-gradient-to-r from-push-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-3xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-blue-100 mb-4">@{user.username}</p>
                <p className="text-blue-100 mb-4 max-w-md">{user.bio}</p>
                
                {/* Wallet Address */}
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-sm">{user.address.slice(0, 10)}...{user.address.slice(-8)}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://scan.push.org/address/${user.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{user.stats.totalPurchases}</div>
                    <div className="text-sm text-blue-200">Purchases</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.stats.totalSales}</div>
                    <div className="text-sm text-blue-200">Sales</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.stats.followers}</div>
                    <div className="text-sm text-blue-200">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.stats.following}</div>
                    <div className="text-sm text-blue-200">Following</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleBotClick}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <Bot className="w-5 h-5" />
                  <span>PushPay Bot</span>
                </button>
                <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 mb-8">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'activity', label: 'Activity', icon: History },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-push-600 text-push-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                      <div className="space-y-4">
                        {user.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === 'purchase' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {activity.type === 'purchase' ? <ShoppingBag className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activity.title}</div>
                              <div className="text-sm text-gray-500">
                                {activity.type === 'purchase' ? 'Purchased' : 'Sold'} for {activity.amount} {activity.currency}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">All Activity</h3>
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Full activity history coming soon!</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">Account Settings</h3>
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Settings panel coming soon!</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold">${user.stats.totalSpent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Earned</span>
                      <span className="font-semibold">${user.stats.totalEarned}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold">{new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* PushPay Bot Card */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <Bot className="w-8 h-8" />
                    <h3 className="text-lg font-semibold">PushPay Bot</h3>
                  </div>
                  <p className="text-purple-100 mb-4 text-sm">
                    Use our Telegram bot for instant payments, bill splitting, and more!
                  </p>
                  <button
                    onClick={handleBotClick}
                    className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    Open Bot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}