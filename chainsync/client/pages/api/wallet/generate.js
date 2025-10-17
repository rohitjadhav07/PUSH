// API route to generate wallet
import { ethers } from 'ethers';
import crypto from 'crypto';

// Inline wallet generation (no external dependencies)
function generateWallet(telegramId) {
  const masterSeed = process.env.MASTER_WALLET_SEED || 'chainsync-universal-commerce-2025';
  const seed = crypto
    .createHash('sha256')
    .update(`${masterSeed}-${telegramId}`)
    .digest('hex');
  
  const wallet = new ethers.Wallet(seed);
  return {
    address: wallet.address,
    telegramId: telegramId
  };
}

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
    const walletData = generateWallet(telegramId);

    // TODO: Register user in database (implement when needed)
    // For now, just return the wallet data

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