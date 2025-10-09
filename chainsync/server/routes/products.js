const express = require('express');
const router = express.Router();

// Mock database - In production, this would be a real database
let products = [
  {
    id: 1,
    title: "Digital Art NFT Collection",
    description: "Unique digital artwork created by renowned artist. This collection features 10 exclusive pieces with cross-chain compatibility.",
    price: 0.5,
    currency: "ETH",
    image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400",
    seller: {
      id: 1,
      name: "ArtistDAO",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      chain: "ethereum",
      rating: 4.8,
      verified: true
    },
    category: "art",
    chains: ["ethereum", "polygon", "solana"],
    socialProof: {
      likes: 234,
      shares: 45,
      views: 1200,
      purchases: 12
    },
    crossChainPricing: {
      ethereum: { amount: 0.5, symbol: "ETH", usdValue: 900 },
      polygon: { amount: 850, symbol: "MATIC", usdValue: 900 },
      solana: { amount: 12, symbol: "SOL", usdValue: 900 }
    },
    tags: ["nft", "art", "digital", "exclusive"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z"
  },
  {
    id: 2,
    title: "Premium Web3 Course",
    description: "Complete guide to building Universal Apps on Push Chain. Learn cross-chain development, smart contracts, and DeFi integration.",
    price: 2.5,
    currency: "PC",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    seller: {
      id: 2,
      name: "Web3Academy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      chain: "push",
      rating: 4.9,
      verified: true
    },
    category: "education",
    chains: ["push", "ethereum", "base"],
    socialProof: {
      likes: 567,
      shares: 89,
      views: 3400,
      purchases: 45
    },
    crossChainPricing: {
      push: { amount: 2.5, symbol: "PC", usdValue: 50 },
      ethereum: { amount: 0.025, symbol: "ETH", usdValue: 50 },
      base: { amount: 0.025, symbol: "ETH", usdValue: 50 }
    },
    tags: ["education", "web3", "course", "development"],
    createdAt: "2024-01-10T08:15:00Z",
    updatedAt: "2024-01-18T16:20:00Z"
  },
  {
    id: 3,
    title: "Gaming Assets Bundle",
    description: "Rare in-game items for multiple metaverse games. Includes weapons, skins, and exclusive collectibles.",
    price: 15,
    currency: "SOL",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
    seller: {
      id: 3,
      name: "GameFi Pro",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      chain: "solana",
      rating: 4.7,
      verified: true
    },
    category: "gaming",
    chains: ["solana", "ethereum", "polygon"],
    socialProof: {
      likes: 892,
      shares: 156,
      views: 5600,
      purchases: 28
    },
    crossChainPricing: {
      solana: { amount: 15, symbol: "SOL", usdValue: 300 },
      ethereum: { amount: 0.15, symbol: "ETH", usdValue: 300 },
      polygon: { amount: 420, symbol: "MATIC", usdValue: 300 }
    },
    tags: ["gaming", "nft", "metaverse", "collectibles"],
    createdAt: "2024-01-12T12:00:00Z",
    updatedAt: "2024-01-19T09:30:00Z"
  },
  {
    id: 4,
    title: "DeFi Strategy Guide",
    description: "Advanced yield farming strategies across multiple chains. Learn to maximize returns while minimizing risks.",
    price: 1.2,
    currency: "PC",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    seller: {
      id: 4,
      name: "DeFi Master",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
      chain: "push",
      rating: 4.6,
      verified: true
    },
    category: "finance",
    chains: ["push", "ethereum", "arbitrum"],
    socialProof: {
      likes: 445,
      shares: 78,
      views: 2100,
      purchases: 67
    },
    crossChainPricing: {
      push: { amount: 1.2, symbol: "PC", usdValue: 24 },
      ethereum: { amount: 0.012, symbol: "ETH", usdValue: 24 },
      arbitrum: { amount: 0.012, symbol: "ETH", usdValue: 24 }
    },
    tags: ["defi", "finance", "strategy", "yield"],
    createdAt: "2024-01-08T15:45:00Z",
    updatedAt: "2024-01-17T11:10:00Z"
  }
];

// GET /api/products - Get all products with filtering
router.get('/', (req, res) => {
  try {
    const { 
      category, 
      chain, 
      search, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let filteredProducts = [...products];

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by chain
    if (chain && chain !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.chains.includes(chain));
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Price filter (convert to USD for comparison)
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => {
        const usdValue = p.crossChainPricing[Object.keys(p.crossChainPricing)[0]].usdValue;
        return usdValue >= parseFloat(minPrice);
      });
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => {
        const usdValue = p.crossChainPricing[Object.keys(p.crossChainPricing)[0]].usdValue;
        return usdValue <= parseFloat(maxPrice);
      });
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.crossChainPricing[Object.keys(a.crossChainPricing)[0]].usdValue;
          bValue = b.crossChainPricing[Object.keys(b.crossChainPricing)[0]].usdValue;
          break;
        case 'popularity':
          aValue = a.socialProof.views + a.socialProof.likes;
          bValue = b.socialProof.views + b.socialProof.likes;
          break;
        case 'rating':
          aValue = a.seller.rating;
          bValue = b.seller.rating;
          break;
        default:
          aValue = new Date(a[sortBy]);
          bValue = new Date(b[sortBy]);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProducts.length / parseInt(limit)),
        totalItems: filteredProducts.length,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        category,
        chain,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product Not Found',
        message: 'The requested product does not exist.'
      });
    }

    // Increment view count
    product.socialProof.views += 1;

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /api/products - Create new product
router.post('/', (req, res) => {
  try {
    const {
      title,
      description,
      price,
      currency,
      image,
      category,
      chains,
      tags,
      seller
    } = req.body;

    // Validation
    if (!title || !description || !price || !currency || !category) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Missing required fields: title, description, price, currency, category'
      });
    }

    // Create new product
    const newProduct = {
      id: products.length + 1,
      title,
      description,
      price: parseFloat(price),
      currency,
      image: image || 'https://via.placeholder.com/400x300',
      seller: seller || {
        id: 999,
        name: 'Anonymous Seller',
        avatar: 'https://via.placeholder.com/100x100',
        chain: 'push',
        rating: 4.0,
        verified: false
      },
      category,
      chains: chains || ['push'],
      socialProof: {
        likes: 0,
        shares: 0,
        views: 0,
        purchases: 0
      },
      crossChainPricing: {
        push: { amount: parseFloat(price), symbol: currency, usdValue: parseFloat(price) * 20 }
      },
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// PUT /api/products/:id/like - Like/unlike product
router.put('/:id/like', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product Not Found'
      });
    }

    // Toggle like (in real app, this would check user's like status)
    product.socialProof.likes += 1;

    res.json({
      success: true,
      data: {
        likes: product.socialProof.likes
      },
      message: 'Product liked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// PUT /api/products/:id/share - Share product
router.put('/:id/share', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product Not Found'
      });
    }

    product.socialProof.shares += 1;

    res.json({
      success: true,
      data: {
        shares: product.socialProof.shares
      },
      message: 'Product shared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /api/products/categories - Get all categories
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    const categoriesWithCounts = categories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: products.filter(p => p.category === category).length
    }));

    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /api/products/chains - Get all supported chains
router.get('/meta/chains', (req, res) => {
  try {
    const allChains = products.flatMap(p => p.chains);
    const uniqueChains = [...new Set(allChains)];
    
    const chainInfo = {
      ethereum: { name: 'Ethereum', icon: '⟠', color: '#627EEA' },
      solana: { name: 'Solana', icon: '◎', color: '#9945FF' },
      polygon: { name: 'Polygon', icon: '⬟', color: '#8247E5' },
      push: { name: 'Push Chain', icon: '🚀', color: '#FF6B9D' },
      base: { name: 'Base', icon: '🔵', color: '#0052FF' },
      arbitrum: { name: 'Arbitrum', icon: '🔷', color: '#28A0F0' }
    };

    const chainsWithInfo = uniqueChains.map(chain => ({
      id: chain,
      ...chainInfo[chain],
      count: allChains.filter(c => c === chain).length
    }));

    res.json({
      success: true,
      data: chainsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;