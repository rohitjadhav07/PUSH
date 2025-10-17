// API route to send tokens
const WalletService = require('../../../../server/wallet-service');
const UserLookupService = require('../../../../server/user-lookup-service');

const walletService = new WalletService();
const userLookup = new UserLookupService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromTelegramId, recipient, amount, message } = req.body;

    if (!fromTelegramId || !recipient || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let result;

    // Check if recipient is a wallet address
    if (recipient.startsWith('0x')) {
      // Send to address directly
      result = await walletService.sendToAddress(
        fromTelegramId,
        recipient,
        parsedAmount,
        message
      );
    } else {
      // Look up recipient by username/phone
      const toTelegramId = await userLookup.getTelegramId(recipient);
      
      if (!toTelegramId) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Send to Telegram ID
      result = await walletService.sendTokens(
        fromTelegramId,
        toTelegramId,
        parsedAmount,
        message
      );
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Send tokens API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to send tokens'
    });
  }
}