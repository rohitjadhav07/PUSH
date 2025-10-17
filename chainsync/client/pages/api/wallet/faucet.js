// API route for faucet
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, amount } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!faucetPrivateKey) {
      return res.status(500).json({ error: 'Faucet not configured' });
    }

    const provider = new ethers.JsonRpcProvider(
      process.env.PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/'
    );
    
    const faucetWallet = new ethers.Wallet(faucetPrivateKey, provider);
    const recipientAddress = generateWallet(telegramId);
    const amountToSend = amount || '10';

    // Send tokens
    const tx = await faucetWallet.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amountToSend),
      gasLimit: 21000n
    });

    const receipt = await tx.wait();

    res.status(200).json({
      success: true,
      data: {
        success: true,
        txHash: receipt.hash,
        amount: amountToSend,
        recipient: recipientAddress
      }
    });

  } catch (error) {
    console.error('Faucet API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Faucet request failed'
    });
  }
}