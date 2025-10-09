const express = require('express');
const router = express.Router();

// Mock social data
let socialPosts = [
  {
    id: 1,
    userId: 1,
    type: 'purchase',
    productId: 1,
    message: 'Just bought this amazing NFT with SOL! 🎨',
    likes: 23,
    shares: 5,
    comments: 8,
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 2,
    userId: 2,
    type: 'share',
    productId: 2,
    message: 'Check out this Web3 course - perfect for beginners! 📚',
    likes: 45,
    shares: 12,
    comments: 15,
    createdAt: '2024-01-19T14:15:00Z'
  }
];

// GET /api/social/feed - Get social feed
router.get('/feed', (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = socialPosts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(socialPosts.length / parseInt(limit)),
        totalItems: socialPosts.length,
        itemsPerPage: parseInt(limit)
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

// POST /api/social/posts - Create social post
router.post('/posts', (req, res) => {
  try {
    const { userId, type, productId, message } = req.body;
    
    const newPost = {
      id: socialPosts.length + 1,
      userId: parseInt(userId),
      type,
      productId: productId ? parseInt(productId) : null,
      message,
      likes: 0,
      shares: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    };
    
    socialPosts.unshift(newPost);
    
    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Social post created successfully'
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