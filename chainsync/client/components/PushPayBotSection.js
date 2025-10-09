import { motion } from 'framer-motion';
import { MessageCircle, Zap, Users, ArrowRight, Bot, Smartphone } from 'lucide-react';

export default function PushPayBotSection() {

  const handleOpenBot = () => {
    window.open('https://t.me/PushPayCryptoBot', '_blank');
  };

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Enhanced Background Effects */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="absolute top-0 left-0 w-full h-full">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 0.8, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Bot className="w-4 h-4 mr-2" />
              Powered by Our Award-Winning Bot
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PushPay Bot</span>
            </h2>

            <p className="text-xl text-gray-300 mb-8">
              The ultimate crypto payment bot that makes sending cryptocurrency as easy as sending a text message.
              Built on Push Chain with real on-chain transactions and advanced features.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300">Natural Language Payments</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300">Split Bills with Friends</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">Telegram Integration</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-gray-300">Mobile-First Design</span>
              </div>
            </div>

            <button
              onClick={handleOpenBot}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Try PushPay Bot
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>

          {/* Right Content - Bot Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Phone Mockup */}
            <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-gray-100 rounded-[2.5rem] overflow-hidden">
                {/* Phone Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">PushPay Bot</div>
                    <div className="text-xs text-blue-200">Online • Push Chain</div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 bg-gray-50 h-full">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                      Send 5 PC to @friend
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border px-4 py-3 rounded-2xl rounded-bl-md max-w-xs shadow-sm">
                      <div className="text-sm text-gray-800 mb-2">💸 <strong>Payment Confirmation</strong></div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>💰 Amount: 5 PC</div>
                        <div>👤 To: @friend</div>
                        <div>⚡ Confirm payment?</div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg">✅ Confirm</button>
                        <button className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-lg">❌ Cancel</button>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="flex justify-start">
                    <div className="bg-green-100 border border-green-200 px-4 py-3 rounded-2xl rounded-bl-md max-w-xs">
                      <div className="text-sm text-green-800 mb-1">🎉 <strong>Payment Sent!</strong></div>
                      <div className="text-xs text-green-600">
                        Transaction confirmed on Push Chain
                      </div>
                    </div>
                  </div>

                  {/* Feature Showcase */}
                  <div className="flex justify-start">
                    <div className="bg-purple-100 border border-purple-200 px-4 py-3 rounded-2xl rounded-bl-md max-w-xs">
                      <div className="text-sm text-purple-800 mb-2">🚀 <strong>Try These Commands:</strong></div>
                      <div className="text-xs text-purple-600 space-y-1">
                        <div>• /balance - Check balance</div>
                        <div>• /faucet - Get test tokens</div>
                        <div>• Split 20 PC between @user1 @user2</div>
                        <div>• Request 10 PC from @friend</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-blue-400" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Users className="w-8 h-8 text-purple-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bot Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
            <p className="text-gray-300 text-sm">
              Send payments using simple commands like "Send 5 PC to @friend" - no complex addresses needed.
            </p>
          </div>

          <div className="text-center text-white">
            <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Social Payments</h3>
            <p className="text-gray-300 text-sm">
              Split bills, request payments, and manage group expenses with friends across different chains.
            </p>
          </div>

          <div className="text-center text-white">
            <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real Blockchain</h3>
            <p className="text-gray-300 text-sm">
              All transactions are real on-chain transfers on Push Chain with instant confirmations and low fees.
            </p>
          </div>
        </motion.div>

        {/* Integration Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
            <Bot className="w-5 h-5 mr-2" />
            <span className="text-sm">
              PushPay Bot seamlessly integrates with ChainSync for the ultimate commerce experience
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}