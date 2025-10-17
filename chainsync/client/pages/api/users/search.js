// API route to search users
// Mock implementation - replace with database when ready

const mockUsers = [
  {
    telegram_id: 123456789,
    username: 'alice',
    first_name: 'Alice',
    last_name: 'Johnson',
    wallet_address: '0x1234567890123456789012345678901234567890'
  },
  {
    telegram_id: 987654321,
    username: 'bob',
    first_name: 'Bob',
    last_name: 'Smith',
    wallet_address: '0x0987654321098765432109876543210987654321'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, limit } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Search mock users
    const searchLower = q.toLowerCase();
    const users = mockUsers.filter(user => 
      user.username?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    ).slice(0, parseInt(limit) || 10);

    // Format response
    const safeUsers = users.map(user => ({
      telegramId: user.telegram_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: `${user.first_name} ${user.last_name}`,
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