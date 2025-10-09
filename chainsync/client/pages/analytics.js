import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Globe,
  Zap,
  Bot,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  useEffect(() => {
    const mockData = {
      overview: {
        totalRevenue: 125000,
        revenueChange: 12.5,
        totalTransactions: 3420,
        transactionsChange: 8.3,
        activeUsers: 1250,
        usersChange: 15.7,
        avgOrderValue: 36.55,
        avgOrderChange: -2.1
      },
      chainDistribution: [
        { chain: 'Push Chain', value: 35, color: '#8B5CF6', transactions: 1197 },
        { chain: 'Ethereum', value: 28, color: '#3B82F6', transactions: 958 },
        { chain: 'Solana', value: 20, color: '#10B981', transactions: 684 },
        { chain: 'Polygon', value: 12, color: '#F59E0B', transactions: 410 },
        { chain: 'Others', value: 5, color: '#6B7280', transactions: 171 }
      ],
      categoryPerformance: [
        { category: 'Digital Art', revenue: 45000, growth: 18.5, orders: 890 },
        { category: 'Education', revenue: 32000, growth: 25.2, orders: 1200 },
        { category: 'Gaming', revenue: 28000, growth: 12.8, orders: 650 },
        { category: 'DeFi', revenue: 20000, growth: 8.9, orders: 680 }
      ],
      recentActivity: [
        { type: 'sale', amount: 2.5, currency: 'PC', user: 'CryptoArtist', time: '2 min ago' },
        { type: 'purchase', amount: 0.8, currency: 'ETH', user: 'NFTCollector', time: '5 min ago' },
        { type: 'sale', amount: 15, currency: 'SOL', user: 'GameFiPro', time: '8 min ago' },
        { type: 'purchase', amount: 1.2, currency: 'PC', user: 'DeFiMaster', time: '12 min ago' }
      ],
      topProducts: [
        { name: 'Digital Masterpiece #001', sales: 45, revenue: 22500, chain: 'ethereum' },
        { name: 'Smart Contract Course', sales: 120, revenue: 18000, chain: 'push' },
        { name: 'Gaming Assets Bundle', sales: 28, revenue: 15400, chain: 'solana' },
        { name: 'DeFi Strategy Guide', sales: 95, revenue: 12800, chain: 'push' }
      ]
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <>
      <Head>
        <title>Analytics Dashboard - ChainSync</title>
        <meta name="description" content="Comprehensive analytics for universal commerce performance" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 pb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 12, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-10 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.8, 1],
                x: [0, 30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                <BarChart3 className="w-4 h-4 mr-2" />
                Real-time Universal Commerce Analytics
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-white">Analytics </span>
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Dashboard
                </motion.span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Track your universal commerce performance across all blockchains. 
                Get insights, optimize strategies, and grow your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Time Range Selector */}
        <section className="py-6 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Time Range:</span>
                <div className="flex space-x-2">
                  {[
                    { id: '24h', label: '24H' },
                    { id: '7d', label: '7D' },
                    { id: '30d', label: '30D' },
                    { id: '90d', label: '90D' }
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleBotClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Bot className="w-4 h-4 mr-2" />
                PushPay Bot Analytics
              </button>
            </div>
          </div>
        </section>

        {/* Main Analytics */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm font-medium ${
                        analyticsData.overview.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analyticsData.overview.revenueChange > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(analyticsData.overview.revenueChange)}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(analyticsData.overview.totalRevenue)}
                    </h3>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm font-medium ${
                        analyticsData.overview.transactionsChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analyticsData.overview.transactionsChange > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(analyticsData.overview.transactionsChange)}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {analyticsData.overview.totalTransactions.toLocaleString()}
                    </h3>
                    <p className="text-gray-600 text-sm">Total Transactions</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm font-medium ${
                        analyticsData.overview.usersChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analyticsData.overview.usersChange > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(analyticsData.overview.usersChange)}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {analyticsData.overview.activeUsers.toLocaleString()}
                    </h3>
                    <p className="text-gray-600 text-sm">Active Users</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm font-medium ${
                        analyticsData.overview.avgOrderChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analyticsData.overview.avgOrderChange > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(analyticsData.overview.avgOrderChange)}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(analyticsData.overview.avgOrderValue)}
                    </h3>
                    <p className="text-gray-600 text-sm">Avg Order Value</p>
                  </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Chain Distribution */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">Chain Distribution</h3>
                    <div className="space-y-4">
                      {analyticsData.chainDistribution.map((chain, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: chain.color }}
                            ></div>
                            <span className="font-medium">{chain.chain}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{chain.value}%</div>
                            <div className="text-sm text-gray-500">{chain.transactions} txns</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Category Performance */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">Category Performance</h3>
                    <div className="space-y-4">
                      {analyticsData.categoryPerformance.map((category, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{category.category}</span>
                            <span className="text-green-600 text-sm font-medium">
                              +{category.growth}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{formatCurrency(category.revenue)}</span>
                            <span>{category.orders} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {analyticsData.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {activity.type === 'sale' ? (
                              <TrendingUp className={`w-5 h-5 ${
                                activity.type === 'sale' ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {activity.type === 'sale' ? 'Sale' : 'Purchase'} - {activity.amount} {activity.currency}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.user} • {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top Products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold mb-6">Top Products</h3>
                    <div className="space-y-4">
                      {analyticsData.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>{product.sales} sales</span>
                                <span>•</span>
                                <span>{getChainIcon(product.chain)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}