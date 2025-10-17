// API route for faucet
const WalletService = require('../../../../server/wallet-service');

const walletService = new WalletService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, amount } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    const result = await walletService.requestFaucet(telegramId, amount || '10');

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Faucet API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Faucet request failed'
    });
  }
}