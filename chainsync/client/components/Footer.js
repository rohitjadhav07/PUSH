import Link from 'next/link';
import { 
  ShoppingBag, 
  Twitter, 
  Github, 
  MessageCircle,
  Bot,
  Globe,
  Zap,
  Heart
} from 'lucide-react';

export default function Footer() {
  const handleBotClick = () => {
    window.open(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-push-600 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ChainSync</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The first Universal Social Commerce platform. Shop anywhere, pay from any chain, 
              sell everywhere. Built on Push Chain.
            </p>
            
            {/* PushPay Bot CTA */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-purple-300">Try PushPay Bot</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Send crypto as easily as sending a text message. Split bills, request payments, and more!
              </p>
              <button
                onClick={handleBotClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Bot
              </button>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-400 hover:text-white transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/social" className="text-gray-400 hover:text-white transition-colors">
                  Social Commerce
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://push.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Push Chain Docs
                </a>
              </li>
              <li>
                <a href="https://faucet.push.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Testnet Faucet
                </a>
              </li>
              <li>
                <a href="https://donut.push.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Block Explorer
                </a>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-push-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-push-400" />
              </div>
              <h4 className="font-semibold mb-2">Universal Commerce</h4>
              <p className="text-sm text-gray-400">Shop from any blockchain, pay with any token</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-400">Instant settlements powered by Push Chain</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold mb-2">Social Commerce</h4>
              <p className="text-sm text-gray-400">Share, discover, and buy with your network</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 ChainSync. Built on Push Chain. Made with ❤️ for universal commerce.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}