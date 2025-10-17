// API route to send tokens
import { ethers } from 'ethers';
import crypto from 'crypto';

function generateWallet(telegramId) {
  const masterSeed = process.env.MASTER_WALLET_SEED || 'chainsync-universal-commerce-2025';
  const seed = crypto
    .createHash('sha256')
    .update(`${masterSeed}-${telegramId}`)
    .digest('hex');
  
  const provider = new ethers.JsonRpcProvider(
    process.env.PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/'
  );
  
  return new ethers.Wallet(seed, provider);
}

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

    // Get sender wallet
    const senderWallet = generateWallet(fromTelegramId);
    
    // Determine recipient address
    let toAddress;
    if (recipient.startsWith('0x')) {
      // Direct address
      toAddress = recipient;
    } else if (recipient.startsWith('@')) {
      // Username - for now, return error (need database)
      return res.status(400).json({ 
        error: 'Username lookup not yet implemented. Please use wallet address.' 
      });
    } else {
      // Assume it's a Telegram ID
      const recipientWallet = generateWallet(recipient);
      toAddress = recipientWallet.address;
    }

    // Check balance
    const balance = await senderWallet.provider.getBalance(senderWallet.address);
    const amountWei = ethers.parseEther(parsedAmount.toString());

    if (balance < amountWei) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Send transaction
    const tx = await senderWallet.sendTransaction({
      to: toAddress,
      value: amountWei,
      gasLimit: 21000n
    });

    const receipt = await tx.wait();

    res.status(200).json({
      success: true,
      data: {
        success: true,
        txHash: receipt.hash,
        from: senderWallet.address,
        to: toAddress,
        amount: parsedAmount,
        message: message,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (error) {
    console.error('Send tokens API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to send tokens'
    });
  }
}