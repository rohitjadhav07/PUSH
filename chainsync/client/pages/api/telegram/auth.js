// API route for Telegram authentication
import crypto from 'crypto';

// Validate Telegram Web App init data
function validateTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return false;
  }
}

// Parse Telegram init data
function parseTelegramInitData(initData) {
  const params = new URLSearchParams(initData);
  const data = {};
  
  for (const [key, value] of params) {
    if (key === 'user') {
      try {
        data.user = JSON.parse(value);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData, action = 'login' } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Missing Telegram init data' });
    }

    // In production, validate with your bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN || 'demo_token';
    
    // For demo purposes, we'll skip validation
    // const isValid = validateTelegramWebAppData(initData, botToken);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid Telegram data' });
    // }

    // Parse the init data
    const telegramData = parseTelegramInitData(initData);
    
    if (!telegramData.user) {
      return res.status(400).json({ error: 'No user data found' });
    }

    const user = telegramData.user;

    // Handle different actions
    switch (action) {
      case 'login':
        // Create or update user in your database
        const userData = {
          telegramId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium,
          photoUrl: user.photo_url,
          allowsWriteToPm: user.allows_write_to_pm,
          lastLogin: new Date().toISOString(),
          // Add ChainSync specific fields
          chainSyncProfile: {
            isActive: true,
            joinedDate: new Date().toISOString(),
            totalPurchases: 0,
            totalSales: 0,
            rating: 5.0,
            walletConnected: false
          }
        };

        // In production, save to database
        // await saveUserToDatabase(userData);

        res.status(200).json({
          success: true,
          user: userData,
          message: 'Authentication successful'
        });
        break;

      case 'logout':
        // Handle logout logic
        res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
        break;

      case 'refresh':
        // Refresh user data
        const refreshedUser = {
          telegramId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url,
          lastRefresh: new Date().toISOString()
        };

        res.status(200).json({
          success: true,
          user: refreshedUser,
          message: 'User data refreshed'
        });
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Telegram auth API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed'
    });
  }
}