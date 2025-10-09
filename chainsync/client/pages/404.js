import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { 
  Home, 
  ShoppingBag, 
  TrendingUp, 
  Users,
  Bot,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Custom404() {
  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  return (
    <>
      <Head>
        <title>Page Not Found - ChainSync</title>
        <meta name="description" content="The page you're looking for doesn't exist in our universal marketplace" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />
        
        <section className="pt-20 pb-16 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated 404 */}
              <motion.div
                className="relative mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 leading-none">
                  404
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -left-4 w-8 h-8 bg-purple-400 rounded-full opacity-60"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-8 -right-8 w-6 h-6 bg-blue-400 rounded-full opacity-60"
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute -bottom-8 left-1/2 w-4 h-4 bg-indigo-400 rounded-full opacity-60"
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Page Not Found in the Universe
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Looks like this page got lost in the cross-chain void. 
                  Don't worry, our universal marketplace has plenty of other amazing destinations!
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/marketplace" className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all duration-200 shadow-sm hover:shadow-lg">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Explore Marketplace
                  </Link>
                </motion.div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal Marketplace</h3>
                  <p className="text-gray-600 text-sm mb-4">Shop from any blockchain, pay with any token</p>
                  <Link href="/marketplace" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    Explore Products →
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Selling</h3>
                  <p className="text-gray-600 text-sm mb-4">List once, sell to all chains universally</p>
                  <Link href="/sell" className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Start Selling →
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Commerce</h3>
                  <p className="text-gray-600 text-sm mb-4">Discover products through your network</p>
                  <Link href="/social" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Join Community →
                  </Link>
                </motion.div>
              </motion.div>

              {/* PushPay Bot CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-12"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Bot className="w-8 h-8" />
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Try PushPay Bot!</h3>
                  <p className="text-indigo-100 mb-6">
                    Send crypto as easily as sending a text message. Perfect for payments and bill splitting!
                  </p>
                  <motion.button
                    onClick={handleBotClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                  >
                    Open PushPay Bot →
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}