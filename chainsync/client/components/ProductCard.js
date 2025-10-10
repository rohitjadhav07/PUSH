import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  Eye,
  Zap,
  Globe,
  ExternalLink,
  Bot,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import chainSyncAPI from '../lib/chainsync-api';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const [liked, setLiked] = useState(false);
  const [selectedChain, setSelectedChain] = useState(product.chains?.[0] || 'push');
  const [isLoading, setIsLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const { isConnected, account, connectWallet } = useWeb3();

  const handleLike = async () => {
    try {
      setLiked(!liked);
      
      // Update local state optimistically
      if (product.socialProof) {
        product.socialProof.likes += liked ? -1 : 1;
      }
      
      toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
      
      // Here you would call the API to update likes
      // await chainSyncAPI.likePost(userTelegramId, product.id);
    } catch (error) {
      console.error('Error liking product:', error);
      setLiked(liked); // Revert on error
      toast.error('Failed to update like status');
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      await connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      // Mock purchase process
      toast.loading('Processing purchase...', { id: 'purchase' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPurchased(true);
      toast.success('Purchase successful! 🎉', { id: 'purchase' });
      
      // Here you would call the actual purchase API
      // const result = await chainSyncAPI.purchaseProduct(userTelegramId, product.id);
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.', { id: 'purchase' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    const shareText = `Check out "${product.title}" on ChainSync! ${shareUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
      
      // Update share count
      if (product.socialProof) {
        product.socialProof.shares += 1;
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  const handleBotPayment = () => {
    const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/PushPayCryptoBot';
    const currentPrice = product.crossChainPricing?.[selectedChain] || { amount: product.price, symbol: 'PC' };
    const message = `I want to buy "${product.title}" for ${currentPrice.amount} ${currentPrice.symbol}`;
    
    window.open(`${botUrl}?start=${encodeURIComponent(message)}`, '_blank');
    toast.success('Opening PushPay Bot...');
  };

  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
    toast.success(`Switched to ${chain.toUpperCase()}`);
  };

  const getChainIcon = (chain) => {
    const icons = {
      ethereum: '⟠',
      solana: '◎',
      polygon: '⬟',
      push: '🚀',
      base: '🔵',
      arbitrum: '🔷'
    };
    return icons[chain] || '🌐';
  };

  const getChainColor = (chain) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-800',
      solana: 'bg-purple-100 text-purple-800',
      polygon: 'bg-indigo-100 text-indigo-800',
      push: 'bg-green-100 text-green-800',
      base: 'bg-blue-100 text-blue-800',
      arbitrum: 'bg-cyan-100 text-cyan-800'
    };
    return colors[chain] || 'bg-gray-100 text-gray-800';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-32 relative flex-shrink-0">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                
                {/* Seller Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-sm text-gray-700">{product.seller.name}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.seller.rating}</span>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {product.crossChainPricing[selectedChain].amount} {product.crossChainPricing[selectedChain].symbol}
                  </div>
                  <div className="text-sm text-gray-500">≈ ${(product.crossChainPricing[selectedChain].amount * 1800).toFixed(2)}</div>
                </div>

                {/* Chain Selector */}
                <div className="flex flex-wrap gap-1 mb-4 justify-end">
                  {product.chains.map((chain) => (
                    <motion.button
                      key={chain}
                      onClick={() => handleChainSelect(chain)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedChain === chain
                          ? 'bg-purple-600 text-white'
                          : getChainColor(chain)
                      }`}
                    >
                      {getChainIcon(chain)} {chain}
                    </motion.button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleBotPayment}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Bot Pay</span>
                  </motion.button>
                  <motion.button
                    onClick={handlePurchase}
                    disabled={isLoading || purchased}
                    whileHover={{ scale: purchased ? 1 : 1.05 }}
                    whileTap={{ scale: purchased ? 1 : 0.95 }}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1 ${
                      purchased 
                        ? 'bg-green-600 text-white cursor-not-allowed' 
                        : isLoading 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {purchased ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    <span>
                      {purchased ? 'Purchased' : isLoading ? 'Buying...' : 'Buy Now'}
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{product.socialProof.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="w-4 h-4" />
                <span>{product.socialProof.shares}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{product.socialProof.views}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </motion.button>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Chain Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {product.chains.slice(0, 3).map((chain) => (
            <span
              key={chain}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${getChainColor(chain)} backdrop-blur-sm`}
            >
              {getChainIcon(chain)}
            </span>
          ))}
          {product.chains.length > 3 && (
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100/90 text-gray-800 backdrop-blur-sm">
              +{product.chains.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Seller Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Image
            src={product.seller.avatar}
            alt={product.seller.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{product.seller.name}</div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">{product.seller.rating}</span>
            </div>
          </div>
        </div>

        {/* Chain Selector */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Pay with:</div>
          <div className="flex flex-wrap gap-1">
            {product.chains.map((chain) => (
              <motion.button
                key={chain}
                onClick={() => handleChainSelect(chain)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedChain === chain
                    ? 'bg-purple-600 text-white'
                    : getChainColor(chain)
                }`}
              >
                {getChainIcon(chain)} {product.crossChainPricing?.[chain]?.amount || product.price} {product.crossChainPricing?.[chain]?.symbol || 'PC'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {product.crossChainPricing[selectedChain]?.amount} {product.crossChainPricing[selectedChain]?.symbol}
          </div>
          <div className="text-sm text-gray-500">≈ ${(product.crossChainPricing[selectedChain]?.amount * 1800).toFixed(2)}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <motion.button
            onClick={handleBotPayment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Bot Pay</span>
          </motion.button>
          <motion.button
            onClick={handlePurchase}
            disabled={isLoading || purchased}
            whileHover={{ scale: purchased ? 1 : 1.05 }}
            whileTap={{ scale: purchased ? 1 : 0.95 }}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 ${
              purchased 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {purchased ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>
              {purchased ? 'Purchased' : isLoading ? 'Buying...' : 'Buy Now'}
            </span>
          </motion.button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{product.socialProof.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span>{product.socialProof.shares}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{product.socialProof.views}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Universal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}