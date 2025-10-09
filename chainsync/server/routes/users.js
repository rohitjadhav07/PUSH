const express = require('express');
const router = express.Router();

// Mock users database
let users = [
  {
    id: 1,
    address: '0xA402d0b03EbFD5C69C1F5cFF1e1C7AFEaE1F6961',
    username: 'crypto_artist',
    displayName: 'Crypto Artist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    bio: 'Digital artist creating NFTs across multiple chains',
    preferredChain: 'ethereum',
    socialLinks: {
      twitter: '@crypto_artist',
      instagram: '@crypto_artist_nft'
    },
    stats: {
      totalSales: 15,
      totalEarnings: 12.5,
      followers: 234,
      following: 89
    },
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 2,
    address: '0x59930b314519fA1fe5529aa188C391F1ccd84640',
    username: 'web3_educator',
    displayName: 'Web3 Educator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    bio: 'Teaching the next generation of Web3 developers',
    preferredChain: 'push',
    socialLinks: {
      twitter: '@web3_educator',
      linkedin: 'web3-educator'
    },
    stats: {
      totalSales: 45,
      totalEarnings: 125.0,
      followers: 567,
      following: 123
    },
    createdAt: '2024-01-05T10:30:00Z'
  }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let filteredUsers = [...users];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower) ||
        user.bio.toLowerCase().includes(searchLower)
      );
    }
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / parseInt(limit)),
        totalItems: filteredUsers.length,
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

// GET /api/users/:address - Get user by address
router.get('/:address', (req, res) => {
  try {
    const { address } = req.params;
    const user = users.find(u => u.address.toLowerCase() === address.toLowerCase());
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: 'User with this address does not exist'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  try {
    const {
      address,
      username,
      displayName,
      bio,
      preferredChain,
      socialLinks
    } = req.body;
    
    if (!address || !username) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Address and username are required'
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.address.toLowerCase() === address.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User Already Exists',
        message: 'User with this address or username already exists'
      });
    }
    
    const newUser = {
      id: users.length + 1,
      address,
      username,
      displayName: displayName || username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: bio || '',
      preferredChain: preferredChain || 'push',
      socialLinks: socialLinks || {},
      stats: {
        totalSales: 0,
        totalEarnings: 0,
        followers: 0,
        following: 0
      },
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// PUT /api/users/:address - Update user
router.put('/:address', (req, res) => {
  try {
    const { address } = req.params;
    const userIndex = users.findIndex(u => u.address.toLowerCase() === address.toLowerCase());
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found'
      });
    }
    
    const updates = req.body;
    delete updates.id; // Prevent ID changes
    delete updates.address; // Prevent address changes
    delete updates.createdAt; // Prevent creation date changes
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /api/users/:address/follow - Follow/unfollow user
router.post('/:address/follow', (req, res) => {
  try {
    const { address } = req.params;
    const { followerAddress } = req.body;
    
    const user = users.find(u => u.address.toLowerCase() === address.toLowerCase());
    const follower = users.find(u => u.address.toLowerCase() === followerAddress.toLowerCase());
    
    if (!user || !follower) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found'
      });
    }
    
    // Toggle follow (simplified - in real app, maintain follow relationships)
    user.stats.followers += 1;
    follower.stats.following += 1;
    
    res.json({
      success: true,
      message: 'User followed successfully',
      data: {
        user: user.stats,
        follower: follower.stats
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

module.exports = router;