# 🚀 Vercel Deployment Guide for ChainSync

## 📋 Quick Deployment Checklist

### ✅ Pre-Deployment (Already Done)
- [x] Code pushed to GitHub
- [x] Telegram bot created (@PushAuthBot)
- [x] Bot token obtained: `8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4`

### 🌐 Vercel Deployment Steps

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import Repository**: Select `rohitjadhav07/PUSH`
5. **Configure Project**:
   ```
   Project Name: chainsync-social-commerce
   Framework: Next.js
   Root Directory: chainsync/client
   Build Command: npm run build (default)
   Output Directory: .next (default)
   Install Command: npm install (default)
   ```

### 🔧 Environment Variables to Add

In Vercel dashboard, add these environment variables:

```env
TELEGRAM_BOT_TOKEN=8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/PushAuthBot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=PushAuthBot
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://rpc.push.org
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
NEXT_PUBLIC_ENABLE_CROSS_CHAIN_PAYMENTS=true
NEXT_PUBLIC_ENABLE_BOT_INTEGRATION=true
```

### 🎯 After Deployment

1. **Get your Vercel URL** (e.g., `https://chainsync-social-commerce.vercel.app`)
2. **Update NEXT_PUBLIC_API_URL** with your actual Vercel URL
3. **Configure Telegram Web App** with @BotFather using your URL
4. **Test the integration**

### 🤖 Telegram Bot Configuration

Once deployed, send these to @BotFather:

**Set Web App:**
```
/newapp
App Name: ChainSync Social Commerce
App URL: https://your-vercel-url.vercel.app/social
Description: Universal social commerce platform
```

**Set Commands:**
```
/setcommands
start - Initialize ChainSync integration
chainsync - Open ChainSync Web App
balance - Check wallet balance
send - Send cryptocurrency
help - Get help
```

### 🔍 Testing Checklist

After deployment, test these:

- [ ] Main site loads: `https://your-url.vercel.app`
- [ ] Social page works: `https://your-url.vercel.app/social`
- [ ] Analytics page: `https://your-url.vercel.app/analytics`
- [ ] Marketplace page: `https://your-url.vercel.app/marketplace`
- [ ] Bot responds to `/start`
- [ ] Web App opens from Telegram
- [ ] Authentication works in Telegram
- [ ] User search functions properly

### 🎉 Success!

Once everything is working:
- ✅ Real Telegram authentication
- ✅ User search by username/phone
- ✅ Interactive charts and analytics
- ✅ Social commerce features
- ✅ Cross-chain payment integration
- ✅ Mobile-optimized Telegram Web App

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test bot configuration with @BotFather
4. Check browser console for errors

Your ChainSync platform will be live with full Telegram integration! 🚀