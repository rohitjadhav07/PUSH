// API route to search users
const UserLookupService = require('../../../../server/user-lookup-service');

const userLookup = new UserLookupService();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, limit } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const users = await userLookup.searchUsers(q, parseInt(limit) || 10);

    // Format response (remove sensitive data)
    const safeUsers = users.map(user => ({
      telegramId: user.telegram_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: userLookup.getUserDisplayName(user),
      walletAddress: user.wallet_address
    }));

    res.status(200).json({
      success: true,
      data: safeUsers,
      count: safeUsers.length
    });

  } catch (error) {
    console.error('Search users API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to search users'
    });
  }
}