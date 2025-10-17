# 🔧 RPC Configuration Guide

## ⚠️ **Important: RPC URL Update**

The original `https://rpc.push.org` doesn't exist. We're using Ethereum Sepolia testnet as a working alternative.

## 🌐 **Current Configuration**

### **Sepolia Testnet (Current):**
```env
PUSH_CHAIN_RPC_URL=https://rpc2.sepolia.org
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://rpc2.sepolia.org
```

**Benefits:**
- ✅ Free testnet
- ✅ Widely supported
- ✅ Reliable RPC endpoints
- ✅ Faucets available
- ✅ Block explorer: https://sepolia.etherscan.io

## 🔄 **Alternative RPC Endpoints**

### **Option 1: Sepolia (Recommended for Testing)**
```env
PUSH_CHAIN_RPC_URL=https://rpc2.sepolia.org
# or
PUSH_CHAIN_RPC_URL=https://ethereum-sepolia.publicnode.com
```

### **Option 2: Polygon Mumbai Testnet**
```env
PUSH_CHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### **Option 3: Infura (Requires API Key)**
```env
PUSH_CHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

### **Option 4: Alchemy (Requires API Key)**
```env
PUSH_CHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

## 🎁 **Getting Testnet Tokens**

### **Sepolia ETH Faucets:**
1. **Alchemy Faucet**: https://sepoliafaucet.com
2. **Infura Faucet**: https://www.infura.io/faucet/sepolia
3. **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia

### **How to Get Tokens:**
1. Go to any faucet above
2. Enter your wallet address
3. Complete captcha/verification
4. Receive 0.5-1 ETH (testnet)
5. Use for testing!

## 🔧 **Update Vercel Environment Variables**

Go to Vercel Dashboard → Project Settings → Environment Variables:

```env
PUSH_CHAIN_RPC_URL=https://rpc2.sepolia.org
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://rpc2.sepolia.org
```

Then redeploy!

## 🏗️ **For Production (When Push Chain Launches)**

When Push Protocol launches their mainnet/testnet:

```env
# Update to actual Push Chain RPC
PUSH_CHAIN_RPC_URL=https://rpc.push.network
# or whatever the official RPC URL is
```

## 🔍 **Block Explorers**

### **Current (Sepolia):**
- **Etherscan**: https://sepolia.etherscan.io
- **View Transaction**: https://sepolia.etherscan.io/tx/[TX_HASH]
- **View Address**: https://sepolia.etherscan.io/address/[ADDRESS]

### **Update Bot Messages:**
Change in webhook.js:
```javascript
const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
```

## 🧪 **Testing Your RPC Connection**

### **Test Script:**
```javascript
const { ethers } = require('ethers');

async function testRPC() {
  const provider = new ethers.JsonRpcProvider('https://rpc2.sepolia.org');
  
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ RPC Connected! Current block:', blockNumber);
    
    const network = await provider.getNetwork();
    console.log('✅ Network:', network.name, 'Chain ID:', network.chainId);
  } catch (error) {
    console.error('❌ RPC Error:', error.message);
  }
}

testRPC();
```

## 📋 **Checklist for RPC Update**

- [ ] Update `.env` file
- [ ] Update `client/.env.local` file
- [ ] Update Vercel environment variables
- [ ] Update block explorer URLs in code
- [ ] Redeploy to Vercel
- [ ] Test faucet command
- [ ] Test balance command
- [ ] Test send command

## 🎯 **Current Status**

**Network**: Ethereum Sepolia Testnet
**RPC**: https://rpc2.sepolia.org
**Chain ID**: 11155111
**Currency**: SepoliaETH (test ETH)
**Explorer**: https://sepolia.etherscan.io

## 💡 **Why Sepolia?**

1. **Reliable**: Maintained by Ethereum Foundation
2. **Free**: No API keys needed
3. **Faucets**: Easy to get test tokens
4. **Explorer**: Full Etherscan support
5. **Compatible**: Works with all Ethereum tools

## 🚀 **Next Steps**

1. **Update environment variables in Vercel**
2. **Redeploy the application**
3. **Get Sepolia ETH from faucet**
4. **Fund your faucet wallet**
5. **Test the bot commands**

Your bot will now work with real blockchain transactions on Sepolia testnet! 🎉