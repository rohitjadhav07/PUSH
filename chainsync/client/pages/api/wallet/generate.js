// API route to generate wallet
const WalletService = require('../../../../server/wallet-service');
const UserLookupService = require('../../../../server/user-lookup-service');

const walletService = new WalletService();
const userLookup = new UserLookupService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, username, firstName, lastName } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Generate wallet
    const walletData = walletService.generateWallet(telegramId);

    // Register user in database
    await userLookup.registerUser({
      telegramId,
      username,
      firstName,
      lastName,
      walletAddress: walletData.address
    });

    res.status(200).json({
      success: true,
      data: {
        address: walletData.address,
        telegramId: telegramId
      }
    });

  } catch (error) {
    console.error('Generate wallet API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to generate wallet'
    });
  }
}