# 💰 ChainSync Wallet Guide

## 🔑 Understanding Your Wallets

ChainSync supports **two types of wallets**:

### **1. 🦊 MetaMask Wallet (External)**
- **Your Address**: `0xBae1C46A4886610C99a7d328C69F3fD3BA2656b8`
- **Type**: External wallet you control
- **Usage**: Connect to interact with blockchain
- **Shown in**: Navbar when connected

### **2. 🎯 ChainSync Wallet (Generated)**
- **Address**: `0x079b15a064c1cD07252CD9FCB1de5561D8D56992`
- **Type**: Generated from your Telegram ID
- **Usage**: Internal ChainSync transactions
- **Shown in**: Profile page (if not connected to MetaMask)

## ✅ **Fixed Issues:**

### **Profile Page Now Shows:**
- ✅ **Connected Wallet**: If MetaMask is connected, shows your MetaMask address
- ✅ **ChainSync Wallet**: If not connected, shows generated wallet
- ✅ **Consistent Display**: Same address in navbar and profile

## 🔧 **Push Chain Network Configuration**

When adding Push Chain to MetaMask, use these settings:

```
Network Name: Push Chain Testnet
RPC URL: https://rpc.push.org
Chain ID: 42069 (0xA455 in hex)
Currency Symbol: PC
Block Explorer: https://scan.push.org
```

### **⚠️ MetaMask Warnings (Normal)**
MetaMask may show warnings when adding Push Chain:
- ❗ "Currency symbol doesn't match" - This is expected
- ❗ "Network name may not match chain ID" - This is expected
- ❗ "RPC URL doesn't match known provider" - This is expected

**These warnings are normal for custom/testnet networks!** ✅

## 🎯 **How It Works:**

### **When You Connect MetaMask:**
1. Click "Connect Wallet" in navbar
2. MetaMask prompts to connect
3. May prompt to add/switch to Push Chain
4. Your MetaMask address appears in navbar
5. Profile page updates to show your MetaMask address

### **Wallet Priority:**
1. **If MetaMask connected** → Use MetaMask wallet
2. **If not connected** → Use ChainSync generated wallet

## 🚀 **Using Your Wallets:**

### **MetaMask Wallet:**
- ✅ Full control of private keys
- ✅ Can send/receive from any dApp
- ✅ Works across all chains
- ✅ Your responsibility to secure

### **ChainSync Wallet:**
- ✅ Automatically generated
- ✅ Linked to Telegram ID
- ✅ Used for internal transactions
- ✅ Managed by ChainSync

## 🔐 **Security Notes:**

1. **Never share private keys** - ChainSync never asks for them
2. **MetaMask is secure** - Your keys stay in your browser
3. **ChainSync wallet** - Generated deterministically from Telegram ID
4. **Two separate wallets** - They don't share funds

## 💡 **Common Questions:**

**Q: Why do I see two different addresses?**
A: One is your MetaMask wallet, one is your ChainSync wallet. After the fix, profile shows your connected MetaMask address.

**Q: Which wallet should I use?**
A: Connect MetaMask for full control. ChainSync wallet is for convenience.

**Q: Can I transfer between them?**
A: Yes! They're both valid Ethereum addresses on Push Chain.

**Q: Is the ChainSync wallet secure?**
A: Yes, but you don't control the private key. Use MetaMask for large amounts.

## 🎉 **After Deployment:**

Once the fix is deployed:
1. **Refresh the page**
2. **Connect MetaMask** (if not already)
3. **Check profile page** - Should show your MetaMask address
4. **Navbar and profile** - Should match now!

Your wallet address will now be consistent across the entire app! ✅