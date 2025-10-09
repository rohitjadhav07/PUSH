import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShoppingBag, 
  Zap, 
  Users, 
  Globe, 
  ArrowRight, 
  Star,
  MessageCircle,
  Smartphone,
  TrendingUp,
  Shield,
  Sparkles,
  Rocket,
  Diamond,
  Coins,
  Eye,
  Heart,
  Share2,
  Bot,
  Layers,
  Network
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PushPayBotSection from '../components/PushPayBotSection';
import FloatingElements from '../components/FloatingElements';
import ParticleBackground from '../components/ParticleBackground';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>ChainSync - Universal Social Commerce | Project G.U.D</title>
        <meta name="description" content="Shop anywhere, pay from any chain, sell everywhere. The first Universal Social Commerce platform built on Push Chain." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Floating Elements */}
        <FloatingElements />
        
        {/* Dynamic Gradient Overlay */}
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
          }}
        />
        
        {/* Animated Grid Background */}
        <div className="fixed inset-0 opacity-10">
          <motion.div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
            animate={{
              backgroundPosition: ['0px 0px', '50px 50px'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 min-h-screen flex items-center">
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {/* Animated Geometric Shapes */}
            <motion.div
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg blur-lg"
              animate={{
                scale: [1, 0.8, 1],
                rotate: [0, -180, -360],
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 50, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </motion.div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <motion.div 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-sm font-medium mb-8 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  </motion.div>
                  Project G.U.D Winner - Universal Commerce Revolution
                </motion.div>
                
                <motion.h1 
                  className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="text-white">Shop </span>
                  <motion.span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Anywhere
                  </motion.span>
                  <br />
                  <span className="text-white">Pay from </span>
                  <motion.span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Any Chain
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  The first <span className="text-purple-400 font-semibold">Universal Social Commerce</span> platform. 
                  Buy from Ethereum sellers with Solana tokens. 
                  Sell to all chains with one listing. <span className="text-cyan-400 font-semibold">Commerce without boundaries.</span>
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/marketplace" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-2xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ShoppingBag className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Explore Universe</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/sell" className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Start Selling
                  </Link>
                </motion.div>
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                {[
                  { number: "5+", label: "Supported Chains", icon: Globe },
                  { number: "$0", label: "Bridge Fees", icon: Zap },
                  { number: "1-Click", label: "Cross-Chain Buy", icon: Rocket },
                  { number: "100%", label: "Social Commerce", icon: Heart }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center group"
                    whileHover={{ scale: 1.1, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30 group-hover:border-purple-400/50 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Why ChainSync is 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Revolutionary</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                The first platform to truly solve cross-chain commerce with social features that drive viral growth
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Universal Commerce",
                  description: "List once, sell to ALL chains. Accept payments from Ethereum, Solana, Polygon, and more. No bridges, no complexity.",
                  gradient: "from-purple-500 to-blue-500",
                  features: ["Cross-chain price optimization", "Automatic currency conversion", "Smart contract escrow"]
                },
                {
                  icon: Users,
                  title: "Social Commerce",
                  description: "Share purchases, get social proof, and discover products through your cross-chain network. Commerce meets social media.",
                  gradient: "from-pink-500 to-purple-500",
                  features: ["Cross-chain social proof", "Viral purchase sharing", "Influencer economy"]
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Powered by Push Chain's universal state. Instant settlements, optimal gas routing, and seamless user experience.",
                  gradient: "from-blue-500 to-cyan-500",
                  features: ["Sub-second confirmations", "Gas optimization engine", "Mobile-first design"]
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center text-sm text-gray-400"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.2 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full mr-3`} />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PushPay Bot Integration Section */}
        <PushPayBotSection />

        {/* How It Works */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-white mb-4">
                How ChainSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Works</span>
              </h2>
              <p className="text-xl text-gray-300">
                Three simple steps to universal commerce
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "List Universal", description: "Create one product listing that's automatically available to users on all supported blockchains. Set your preferred payment chain and let ChainSync handle the rest.", icon: Layers },
                { step: "2", title: "Buy Cross-Chain", description: "Customers can purchase from any supported blockchain using their preferred tokens. Our smart routing finds the optimal path for every transaction.", icon: Network },
                { step: "3", title: "Share & Grow", description: "Every purchase becomes social content. Share across platforms, build your reputation, and grow your business through viral social commerce.", icon: Share2 }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <motion.div
                    className="relative w-24 h-24 mx-auto mb-6"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <step.icon className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-5xl md:text-6xl font-bold text-white mb-6"
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(147, 51, 234, 0.5)',
                    '0 0 40px rgba(147, 51, 234, 0.8)',
                    '0 0 20px rgba(147, 51, 234, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready to Go Universal?
              </motion.h2>
              <p className="text-xl text-gray-300 mb-8">
                Join the commerce revolution. Deploy once, reach users from every blockchain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/marketplace" className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/sell" className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Start Selling
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { background-position: 0px 0px; }
          100% { background-position: 50px 50px; }
        }
      `}</style>
    </>
  );
}