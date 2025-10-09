import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  Globe,
  TrendingUp,
  Bot
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Marketplace() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChain, setSelectedChain] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        title: "Digital Art NFT Collection",
        description: "Unique digital artwork created by renowned artist",
        price: 0.5,
        currency: "ETH",
        image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400",
        seller: {
          name: "ArtistDAO",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          chain: "ethereum",
          rating: 4.8
        },
        category: "art",
        chains: ["ethereum", "polygon", "solana"],
        socialProof: {
          likes: 234,
          shares: 45,
          views: 1200
        },
        crossChainPricing: {
          ethereum: { amount: 0.5, symbol: "ETH" },
          polygon: { amount: 850, symbol: "MATIC" },
          solana: { amount: 12, symbol: "SOL" }
        }
      },
      {
        id: 2,
        title: "Premium Web3 Course",
        description: "Complete guide to building on Push Chain",
        price: 2.5,
        currency: "PC",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
        seller: {
          name: "Web3Academy",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          chain: "push",
          rating: 4.9
        },
        category: "education",
        chains: ["push", "ethereum", "base"],
        socialProof: {
          likes: 567,
          shares: 89,
          views: 3400
        },
        crossChainPricing: {
          push: { amount: 2.5, symbol: "PC" },
          ethereum: { amount: 0.001, symbol: "ETH" },
          base: { amount: 0.001, symbol: "ETH" }
        }
      },
      {
        id: 3,
        title: "Gaming Assets Bundle",
        description: "Rare in-game items for multiple metaverse games",
        price: 15,
        currency: "SOL",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
        seller: {
          name: "GameFi Pro",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          chain: "solana",
          rating: 4.7
        },
        category: "gaming",
        chains: ["solana", "ethereum", "polygon"],
        socialProof: {
          likes: 892,
          shares: 156,
          views: 5600
        },
        crossChainPricing: {
          solana: { amount: 15, symbol: "SOL" },
          ethereum: { amount: 0.25, symbol: "ETH" },
          polygon: { amount: 420, symbol: "MATIC" }
        }
      },
      {
        id: 4,
        title: "DeFi Strategy Guide",
        description: "Advanced yield farming strategies across chains",
        price: 1.2,
        currency: "PC",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
        seller: {
          name: "DeFi Master",
          avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
          chain: "push",
          rating: 4.6
        },
        category: "finance",
        chains: ["push", "ethereum", "arbitrum"],
        socialProof: {
          likes: 445,
          shares: 78,
          views: 2100
        },
        crossChainPricing: {
          push: { amount: 1.2, symbol: "PC" },
          ethereum: { amount: 0.0008, symbol: "ETH" },
          arbitrum: { amount: 0.0008, symbol: "ETH" }
        }
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories', count: products.length },
    { id: 'art', name: 'Digital Art', count: products.filter(p => p.category === 'art').length },
    { id: 'education', name: 'Education', count: products.filter(p => p.category === 'education').length },
    { id: 'gaming', name: 'Gaming', count: products.filter(p => p.category === 'gaming').length },
    { id: 'finance', name: 'DeFi', count: products.filter(p => p.category === 'finance').length }
  ];

  const chains = [
    { id: 'all', name: 'All Chains', icon: '🌐' },
    { id: 'push', name: 'Push Chain', icon: '🚀' },
    { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
    { id: 'solana', name: 'Solana', icon: '◎' },
    { id: 'polygon', name: 'Polygon', icon: '⬟' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesChain = selectedChain === 'all' || product.chains.includes(selectedChain);
    
    return matchesSearch && matchesCategory && matchesChain;
  });

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  return (
    <>
      <Head>
        <title>Universal Marketplace - ChainSync</title>
        <meta name="description" content="Shop from any blockchain, pay with any token. The first universal marketplace powered by Push Chain." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 pb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.8, 1],
                x: [0, -30, 0],
                y: [0, 20, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                  <Globe className="w-4 h-4 mr-2" />
                  Universal Cross-Chain Marketplace
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">Universal </span>
                  <motion.span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Marketplace
                  </motion.span>
                </h1>
                
                <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                  Shop from sellers on any blockchain. Pay with your preferred tokens. 
                  The future of cross-chain commerce is here.
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm text-blue-200">Chains</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{products.length}</div>
                    <div className="text-sm text-blue-200">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">$0</div>
                    <div className="text-sm text-blue-200">Bridge Fees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">1-Click</div>
                    <div className="text-sm text-blue-200">Purchase</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PushPay Bot Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5" />
                <span className="text-sm font-medium">
                  💡 Pro Tip: Use our PushPay Bot for instant payments and bill splitting!
                </span>
              </div>
              <button
                onClick={handleBotClick}
                className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Try Bot →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products across all chains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-push-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              {/* Chain Filter */}
              <div className="flex flex-wrap gap-2">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      selectedChain === chain.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{chain.icon}</span>
                    <span>{chain.name}</span>
                  </button>
                ))}
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-push-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-push-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedChain('all');
                  }}
                  className="px-6 py-3 bg-push-600 text-white rounded-lg hover:bg-push-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}