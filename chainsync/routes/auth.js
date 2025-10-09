const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  displayName: Joi.string().min(2).max(50).required(),
  ethereumAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  polygonAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  solanaAddress: Joi.string(),
  baseAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  pushChainAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/)
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500),
  email: Joi.string().email(),
  ethereumAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  polygonAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  solanaAddress: Joi.string(),
  baseAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  pushChainAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  socialLinks: Joi.object(),
  notificationSettings: Joi.object(),
  privacySettings: Joi.object()
});

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    return null;
  }
}

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }

  req.user = decoded;
  next();
};

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const {
      username,
      email,
      password,
      displayName,
      ethereumAddress,
      polygonAddress,
      solanaAddress,
      baseAddress,
      pushChainAddress
    } = value;

    // Check if user already exists
    const existingUser = await req.database.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    const existingEmail = await req.database.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Generate wallet if no addresses provided
    let walletAddresses = {
      ethereumAddress,
      polygonAddress,
      solanaAddress,
      baseAddress,
      pushChainAddress
    };

    if (!ethereumAddress && !polygonAddress && !pushChainAddress) {
      const newWallet = await req.universalChain.generateWallet();
      walletAddresses = {
        ethereumAddress: newWallet.address,
        polygonAddress: newWallet.address,
        baseAddress: newWallet.address,
        pushChainAddress: newWallet.address,
        solanaAddress: solanaAddress || null
      };
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      username,
      email,
      displayName,
      passwordHash,
      ...walletAddresses
    };

    const userId = await req.database.createUser(userData);

    // Generate token
    const user = await req.database.getUserById(userId);
    const token = generateToken(user);

    // Log analytics event
    await req.database.logEvent({
      userId,
      eventType: 'user_registered',
      eventData: {
        method: 'email',
        hasWallets: !!(ethereumAddress || polygonAddress || pushChainAddress)
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Remove sensitive data from response
    const { password_hash, ...userResponse } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
        walletGenerated: !ethereumAddress && !polygonAddress && !pushChainAddress
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { username, password } = value;

    // Find user
    const user = await req.database.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Update last active
    await req.database.updateUserProfile(user.id, {
      last_active: new Date().toISOString()
    });

    // Log analytics event
    await req.database.logEvent({
      userId: user.id,
      eventType: 'user_login',
      eventData: { method: 'password' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Remove sensitive data from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// POST /api/auth/wallet-login - Login with wallet signature
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Address, signature, and message are required'
      });
    }

    // Verify signature (simplified - in production use proper signature verification)
    // This would verify that the signature was created by the private key of the address
    
    // Find user by wallet address
    const user = await req.database.getUserByWalletAddress(address);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Wallet not registered'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Update last active
    await req.database.updateUserProfile(user.id, {
      last_active: new Date().toISOString()
    });

    // Log analytics event
    await req.database.logEvent({
      userId: user.id,
      eventType: 'user_login',
      eventData: { method: 'wallet', address },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Remove sensitive data from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Wallet login successful'
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({
      success: false,
      error: 'Wallet login failed'
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await req.database.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive data
    const { password_hash, ...userResponse } = user;

    // Parse JSON fields
    userResponse.social_links = JSON.parse(user.social_links || '{}');
    userResponse.notification_settings = JSON.parse(user.notification_settings || '{}');
    userResponse.privacy_settings = JSON.parse(user.privacy_settings || '{}');

    res.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if email is being changed and is unique
    if (value.email) {
      const existingEmail = await req.database.getUserByEmail(value.email);
      if (existingEmail && existingEmail.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Prepare update data
    const updateData = { ...value };
    
    // Stringify JSON fields
    if (value.socialLinks) {
      updateData.social_links = JSON.stringify(value.socialLinks);
      delete updateData.socialLinks;
    }
    if (value.notificationSettings) {
      updateData.notification_settings = JSON.stringify(value.notificationSettings);
      delete updateData.notificationSettings;
    }
    if (value.privacySettings) {
      updateData.privacy_settings = JSON.stringify(value.privacySettings);
      delete updateData.privacySettings;
    }

    // Update user profile
    await req.database.updateUserProfile(req.user.id, updateData);

    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'profile_updated',
      eventData: { fields: Object.keys(value) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get current user
    const user = await req.database.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await req.database.updateUserProfile(req.user.id, {
      password_hash: newPasswordHash
    });

    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'password_changed',
      eventData: {},
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'user_logout',
      eventData: {},
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// GET /api/auth/verify-token - Verify if token is valid
router.get('/verify-token', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: req.user
    }
  });
});

module.exports = router;