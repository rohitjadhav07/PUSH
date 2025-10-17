# 🍩 Push Chain Donut Testnet Configuration

## 🎉 **Official Push Chain Testnet!**

We're now using the **real Push Chain Donut Testnet** - not a substitute!

## 🌐 **Network Details**

### **Push Chain Donut Testnet:**
```
Network Name: Push Chain Donut Testnet
RPC URL: https://evm.rpc-testnet-donut-node1.push.org/
Alternative RPC: https://evm.rpc-testnet-donut-node2.push.org/
Chain ID: 42101
Currency Symbol: PC
Block Explorer: https://donut.push.network
```

## 🔧 **Environment Variables**

### **Update Your `.env` Files:**

**Server `.env`:**
```env
PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
```

**Client `.env.local`:**
```env
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
```

### **Vercel Environment Variables:**
Go to Vercel Dashboard → Settings → Environment Variables:
```env
PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
TELEGRAM_BOT_TOKEN=8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4
MASTER_WALLET_SEED=chainsync-universal-commerce-2025
FAUCET_PRIVATE_KEY=0x1b890461d2c11ecdbcd832a6ae7f2ad62fddb8cfc3be237dbc3cb0585de18039
NEXT_PUBLIC_API_URL=https://chainsync-social-commerce.vercel.app
```

Then **Redeploy**!

## 🎁 **Getting Push Chain PC Tokens**

### **Option 1: Use Your Bot's Faucet**
```
/faucet
```
This will give you 10 PC from your faucet wallet!

### **Option 2: Push Chain Faucet (If Available)**
Check Push Protocol's official channels for faucet:
- Discord: https://discord.gg/pushprotocol
- Twitter: https://twitter.com/pushprotocol
- Docs: https://docs.push.org

### **Option 3: Fund Your Faucet Wallet**
Your faucet wallet needs PC tokens to distribute. Get the address:
```javascript
const { ethers } = require('ethers');
const wallet = new ethers.Wallet('0x1b890461d2c11ecdbcd832a6ae7f2ad62fddb8cfc3be237dbc3cb0585de18039');
console.log('Faucet Address:', wallet.address);
// Address: 0xBae1C46A4886610C99a7d328C69F3fD3BA2656b8
```

Request PC tokens for this address from Push Protocol community.

## 🔍 **Block Explorer**

### **Push Chain Donut Explorer:**
- **Homepage**: https://donut.push.network
- **View Transaction**: https://donut.push.network/tx/[TX_HASH]
- **View Address**: https://donut.push.network/address/[ADDRESS]
- **View Block**: https://donut.push.network/block/[BLOCK_NUMBER]

## 🦊 **Add to MetaMask**

### **Manual Configuration:**
1. Open MetaMask
2. Click Networks → Add Network
3. Enter these details:
   - **Network Name**: Push Chain Donut Testnet
   - **RPC URL**: https://evm.rpc-testnet-donut-node1.push.org/
   - **Chain ID**: 42101
   - **Currency Symbol**: PC
   - **Block Explorer**: https://donut.push.network

### **Or Use This Button:**
```html
<button onclick="addPushChain()">Add Push Chain to MetaMask</button>

<script>
async function addPushChain() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xA455', // 42101 in hex
        chainName: 'Push Chain Donut Testnet',
        nativeCurrency: {
          name: 'Push Coin',
          symbol: 'PC',
          decimals: 18
        },
        rpcUrls: ['https://evm.rpc-testnet-donut-node1.push.org/'],
        blockExplorerUrls: ['https://donut.push.network']
      }]
    });
  } catch (error) {
    console.error('Error adding network:', error);
  }
}
</script>
```

## 🧪 **Test Your Connection**

### **Test Script:**
```javascript
const { ethers } = require('ethers');

async function testPushChain() {
  const provider = new ethers.JsonRpcProvider(
    'https://evm.rpc-testnet-donut-node1.push.org/'
  );
  
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected to Push Chain!');
    console.log('Current Block:', blockNumber);
    
    const network = await provider.getNetwork();
    console.log('Chain ID:', network.chainId.toString());
    console.log('Network Name:', network.name);
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

testPushChain();
```

## 🤖 **Bot Commands on Push Chain**

### **Check Balance:**
```
/balance
```
Shows your real PC balance on Push Chain Donut Testnet

### **Get Faucet Tokens:**
```
/faucet
```
Receive 10 PC from the faucet

### **Send Money:**
```
/send 1 PC to @username
```
Real transaction on Push Chain!

### **View Transaction:**
All transactions include a link to Push Chain Explorer:
```
🔗 View on Push Chain Explorer
```

## 📊 **Network Comparison**

| Feature | Push Chain Donut | Sepolia (Old) |
|---------|------------------|---------------|
| **Network** | Push Protocol Official | Ethereum Testnet |
| **RPC** | evm.rpc-testnet-donut-node1.push.org | rpc2.sepolia.org |
| **Chain ID** | 42101 | 11155111 |
| **Currency** | PC | SepoliaETH |
| **Explorer** | donut.push.network | sepolia.etherscan.io |
| **Purpose** | Push Protocol Ecosystem | General Ethereum Testing |

## 🎯 **Why Push Chain?**

1. **Official Network**: Built by Push Protocol team
2. **Native PC Token**: Use actual Push Coin
3. **Optimized**: Designed for Push Protocol features
4. **Community**: Active Push Protocol community
5. **Future-Ready**: Will transition to mainnet

## 🚀 **Deployment Checklist**

- [x] Update `.env` with Push Chain RPC
- [x] Update `.env.local` with Push Chain RPC
- [ ] Update Vercel environment variables
- [ ] Redeploy application
- [ ] Get PC tokens for faucet wallet
- [ ] Test `/faucet` command
- [ ] Test `/balance` command
- [ ] Test `/send` command
- [ ] Verify transactions on Push Chain Explorer

## 🔗 **Useful Links**

- **Push Protocol Website**: https://push.org
- **Documentation**: https://docs.push.org
- **Discord**: https://discord.gg/pushprotocol
- **Twitter**: https://twitter.com/pushprotocol
- **GitHub**: https://github.com/push-protocol
- **Block Explorer**: https://donut.push.network

## 💡 **Pro Tips**

1. **Backup RPC**: If node1 is slow, use node2:
   ```
   https://evm.rpc-testnet-donut-node2.push.org/
   ```

2. **Check Explorer**: Always verify transactions on:
   ```
   https://donut.push.network
   ```

3. **Join Community**: Get help and PC tokens from Push Discord

4. **Save Addresses**: Bookmark your wallet on the explorer

## 🎊 **You're Now on Real Push Chain!**

Your ChainSync platform is now running on the **official Push Chain Donut Testnet**!

All transactions are:
- ✅ Real Push Chain transactions
- ✅ Viewable on Push Chain Explorer
- ✅ Using actual PC tokens
- ✅ Part of Push Protocol ecosystem

**Welcome to Push Chain!** 🍩🚀