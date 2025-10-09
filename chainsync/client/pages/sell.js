import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Upload, 
  DollarSign, 
  Globe, 
  Zap,
  Bot,
  TrendingUp,
  Users,
  ShoppingBag
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Sell() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'PC',
    category: 'art',
    chains: ['push']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product submission:', formData);
    // Handle form submission
  };

  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  return (
    <>
      <Head>
        <title>Start Selling - ChainSync</title>
        <meta name="description" content="List your products on ChainSync and reach customers across all blockchains" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 pb-12 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.7, 1],
                x: [0, 40, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                <TrendingUp className="w-4 h-4 mr-2" />
                Start Your Universal Commerce Journey
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Start Selling </span>
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Universally
                </motion.span>
              </h1>
              
              <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                List once, sell to all chains. Reach customers on Ethereum, Solana, Polygon, and more. 
                The future of commerce is universal.
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Universal Reach</h3>
                  <p className="text-sm text-blue-100">Sell to customers on any blockchain</p>
                </div>
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Instant Payments</h3>
                  <p className="text-sm text-blue-100">Get paid instantly in your preferred token</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                  <h3 className="font-semibold mb-2">Social Commerce</h3>
                  <p className="text-sm text-blue-100">Leverage social proof for viral growth</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sell Form */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl p-8 shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">List Your Product</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-push-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-push-600 text-white rounded-lg hover:bg-push-700 transition-colors"
                        >
                          Choose Files
                        </button>
                      </div>
                    </div>

                    {/* Product Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                        placeholder="Enter your product title"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                        placeholder="Describe your product..."
                        required
                      />
                    </div>

                    {/* Price and Currency */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                        >
                          <option value="PC">PC (Push Chain)</option>
                          <option value="ETH">ETH (Ethereum)</option>
                          <option value="SOL">SOL (Solana)</option>
                          <option value="MATIC">MATIC (Polygon)</option>
                        </select>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-push-500 focus:border-transparent"
                      >
                        <option value="art">Digital Art</option>
                        <option value="education">Education</option>
                        <option value="gaming">Gaming</option>
                        <option value="finance">DeFi</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-to-r from-push-600 to-blue-600 text-white font-semibold rounded-xl hover:from-push-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                    >
                      List Product Universally
                    </button>
                  </form>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Benefits Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold mb-4">Why Sell on ChainSync?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-push-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-push-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Universal Reach</h4>
                        <p className="text-sm text-gray-600">Reach customers on all major blockchains</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Low Fees</h4>
                        <p className="text-sm text-gray-600">Only 2.5% transaction fee</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Social Growth</h4>
                        <p className="text-sm text-gray-600">Viral marketing through social commerce</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* PushPay Bot Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Bot className="w-8 h-8" />
                    <h3 className="text-lg font-semibold">PushPay Bot</h3>
                  </div>
                  <p className="text-purple-100 mb-4 text-sm">
                    Your customers can pay instantly using our Telegram bot! Natural language payments make buying effortless.
                  </p>
                  <button
                    onClick={handleBotClick}
                    className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    Try PushPay Bot
                  </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold mb-4">Platform Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Sellers</span>
                      <span className="font-semibold">1,250+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sales</span>
                      <span className="font-semibold">$125K+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supported Chains</span>
                      <span className="font-semibold">5+</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}