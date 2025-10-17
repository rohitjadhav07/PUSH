// API route to get wallet balance
const WalletService = require('../../../../../server/wallet-service');

const walletService = new WalletService();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    const balanceData = await walletService.getBalance(telegramId);

    res.status(200).json({
      success: true,
      data: balanceData
    });

  } catch (error) {
    console.error('Get balance API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get balance'
    });
  }
}