// API route for Telegram user search
import crypto from 'crypto';

// Mock user database - In production, this would be a real database
const mockUsers = [
  {
    id: 1,
    telegramId: 123456789,
    username: 'cryptoartist',
    firstName: 'Alex',
    lastName: 'Johnson',
    phoneNumber: '+1234567890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    isVerified: true,
    isOnline: true,
    lastSeen: new Date(),
    mutualFriends: 12,
    chainSyncProfile: {
      totalPurchases: 45,
      totalSales: 23,
      rating: 4.8,
      joinedDate: '2023-01-15',
      walletAddress: '0x1234...5678'
    }
  },
  {
    id: 2,
    telegramId: 987654321,
    username: 'web3builder',
    firstName: 'Sarah',
    lastName: 'Chen',
    phoneNumber: '+1987654321',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    isVerified: false,
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    mutualFriends: 8,
    chainSyncProfile: {
      totalPurchases: 67,
      totalSales: 34,
      rating: 4.9,
      joinedDate: '2023-03-22',
      walletAddress: '0x8765...4321'
    }
  },
  {
    id: 3,
    telegramId: 555123456,
    username: 'nftcollector',
    firstName: 'Mike',
    lastName: 'Rodriguez',
    phoneNumber: '+1555123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    isVerified: true,
    isOnline: true,
    lastSeen: new Date(),
    mutualFriends: 25,
    chainSyncProfile: {
      totalPurchases: 123,
      totalSales: 89,
      rating: 4.7,
      joinedDate: '2022-11-08',
      walletAddress: '0x9999...1111'
    }
  }
];

// Validate Telegram Web App data
function validateTelegramData(initData, botToken) {
  // In production, implement proper validation
  // This is a simplified version for demo purposes
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram data validation error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, telegramData, searchType = 'all' } = req.body;

    // Validate request
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // In production, validate Telegram data
    // const isValidTelegram = validateTelegramData(telegramData, process.env.TELEGRAM_BOT_TOKEN);
    // if (!isValidTelegram) {
    //   return res.status(401).json({ error: 'Invalid Telegram data' });
    // }

    // Search users based on query and type
    const searchQuery = query.toLowerCase().trim();
    const phoneQuery = query.replace(/\D/g, ''); // Remove non-digits for phone search

    let filteredUsers = mockUsers.filter(user => {
      const matchesUsername = user.username?.toLowerCase().includes(searchQuery);
      const matchesFirstName = user.firstName?.toLowerCase().includes(searchQuery);
      const matchesLastName = user.lastName?.toLowerCase().includes(searchQuery);
      const matchesPhone = phoneQuery && user.phoneNumber?.includes(phoneQuery);
      const matchesTelegramId = user.telegramId?.toString().includes(searchQuery);

      switch (searchType) {
        case 'username':
          return matchesUsername;
        case 'phone':
          return matchesPhone;
        case 'name':
          return matchesFirstName || matchesLastName;
        default:
          return matchesUsername || matchesFirstName || matchesLastName || matchesPhone || matchesTelegramId;
      }
    });

    // Sort results by relevance
    filteredUsers = filteredUsers.sort((a, b) => {
      // Prioritize exact username matches
      if (a.username === searchQuery) return -1;
      if (b.username === searchQuery) return 1;
      
      // Then by verification status
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      
      // Then by online status
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // Finally by mutual friends
      return b.mutualFriends - a.mutualFriends;
    });

    // Limit results
    const limitedResults = filteredUsers.slice(0, 10);

    // Format response (remove sensitive data)
    const safeResults = limitedResults.map(user => ({
      id: user.id,
      telegramId: `@${user.username}`,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isOnline: user.isOnline,
      lastSeen: user.isOnline ? 'online' : formatLastSeen(user.lastSeen),
      mutualFriends: user.mutualFriends,
      chainSyncProfile: {
        totalPurchases: user.chainSyncProfile.totalPurchases,
        totalSales: user.chainSyncProfile.totalSales,
        rating: user.chainSyncProfile.rating,
        joinedDate: user.chainSyncProfile.joinedDate
      }
    }));

    res.status(200).json({
      success: true,
      results: safeResults,
      total: safeResults.length,
      query: searchQuery
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Helper function to format last seen time
function formatLastSeen(lastSeen) {
  const now = new Date();
  const diff = now - new Date(lastSeen);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return new Date(lastSeen).toLocaleDateString();
}