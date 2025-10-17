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
    console.log('🔍 Balance request for Telegram ID:', telegramId);

    if (!telegramId) {
      console.error('❌ Missing telegram ID');
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Get wallet address
    const address = generateWallet(telegramId);
    console.log('📍 Generated wallet address:', address);
    
    // Get balance from blockchain
    const rpcUrl = process.env.PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/';
    console.log('🌐 Using RPC URL:', rpcUrl);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('⏳ Fetching balance from blockchain...');
    const balance = await provider.getBalance(address);
    console.log('✅ Balance fetched:', balance.toString(), 'wei');

    const result = {
      success: true,
      data: {
        balance: ethers.formatEther(balance),
        address: address,
        balanceWei: balance.toString()
      }
    };
    
    console.log('📤 Sending response:', JSON.stringify(result));
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Get balance API error:', {
      message: error.message,
      stack: error.stack,
      telegramId: req.query.telegramId
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to get balance'
    });
  }
}