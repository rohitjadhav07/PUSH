// Real Telegram Web App Data Validation
import crypto from 'crypto';

// Validate Telegram Web App init data
function validateTelegramWebAppData(initData, botToken) {
  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      throw new Error('No hash provided');
    }
    
    // Remove hash from params for validation
    urlParams.delete('hash');
    
    // Create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key using bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare hashes
    const isValid = expectedHash === hash;
    
    if (!isValid) {
      throw new Error('Invalid hash signature');
    }
    
    // Check auth date (should be within last 24 hours for security)
    const authDate = parseInt(urlParams.get('auth_date'));
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;
    
    // Allow 24 hours (86400 seconds)
    if (timeDiff > 86400) {
      throw new Error('Auth data is too old');
    }
    
    return true;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return false;
  }
}

// Parse user data from init data
function parseUserData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      throw new Error('No user data found');
    }
    
    const user = JSON.parse(userParam);
    
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      languageCode: user.language_code,
      isPremium: user.is_premium || false,
      allowsWriteToPm: user.allows_write_to_pm || false,
      authDate: parseInt(urlParams.get('auth_date')),
      queryId: urlParams.get('query_id'),
      chatType: urlParams.get('chat_type'),
      chatInstance: urlParams.get('chat_instance')
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    throw new Error('Invalid user data format');
  }
}

// Create or update user in database (mock implementation)
async function createOrUpdateUser(userData) {
  // In a real implementation, this would interact with your database
  // For now, we'll return the user data with additional ChainSync fields
  
  const chainSyncUser = {
    ...userData,
    chainSyncId: `cs_${userData.id}`,
    joinedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profile: {
      totalPurchases: 0,
      totalSales: 0,
      rating: 5.0,
      isVerified: userData.isPremium || false,
      walletConnected: false,
      preferences: {
        notifications: true,
        publicProfile: true,
        allowSearch: true
      }
    },
    social: {
      friends: [],
      following: [],
      followers: []
    }
  };
  
  return chainSyncUser;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing init data' 
      });
    }

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Bot token not configured' 
      });
    }

    // Validate the Telegram data
    const isValid = validateTelegramWebAppData(initData, botToken);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid Telegram authentication data' 
      });
    }

    // Parse user data
    const userData = parseUserData(initData);
    
    // Create or update user in database
    const user = await createOrUpdateUser(userData);
    
    // Return success response
    res.status(200).json({
      success: true,
      user: user,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Telegram validation API error:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}