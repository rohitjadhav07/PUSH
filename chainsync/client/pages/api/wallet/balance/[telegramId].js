// API route to get wallet balance
import { ethers } from 'ethers';
import crypto from 'crypto';

function generateWallet(telegramId) {
  const masterSeed = process.env.MASTER_WALLET_SEED || 'chainsync-universal-commerce-2025';
  const seed = crypto
    .createHash('sha256')
    .update(`${masterSeed}-${telegramId}`)
    .digest('hex');
  
  const wallet = new ethers.Wallet(seed);
  return wallet.address;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Get wallet address
    const address = generateWallet(telegramId);
    
    // Get balance from blockchain
    const provider = new ethers.JsonRpcProvider(
      process.env.PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/'
    );
    
    const balance = await provider.getBalance(address);

    res.status(200).json({
      success: true,
      data: {
        balance: ethers.formatEther(balance),
        address: address,
        balanceWei: balance.toString()
      }
    });

  } catch (error) {
    console.error('Get balance API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get balance'
    });
  }
}