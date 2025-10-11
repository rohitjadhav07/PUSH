# 🔧 Vercel Environment Variables Setup

## 🚨 **CRITICAL: Bot Not Responding Fix**

Your bot isn't responding because the **TELEGRAM_BOT_TOKEN** environment variable is missing in Vercel!

## 📋 **Required Environment Variables**

Go to your Vercel dashboard → Project Settings → Environment Variables and add these:

### **🤖 Telegram Bot Configuration**
```env
TELEGRAM_BOT_TOKEN=8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/PushAuthBot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=PushAuthBot
```

### **🌐 API Configuration**
```env
NEXT_PUBLIC_API_URL=https://chainsync-social-commerce.vercel.app
NODE_ENV=production
```

### **⛓️ Blockchain Configuration**
```env
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://rpc.push.org
PUSH_CHAIN_RPC_URL=https://rpc.push.org
```

### **🎯 Feature Flags**
```env
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
NEXT_PUBLIC_ENABLE_CROSS_CHAIN_PAYMENTS=true
NEXT_PUBLIC_ENABLE_BOT_INTEGRATION=true
```

### **🔐 Security (Optional)**
```env
JWT_SECRET=chainsync-jwt-secret-production
ENCRYPTION_KEY=chainsync-encryption-production
```

## 🚀 **How to Add Environment Variables in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project**: chainsync-social-commerce
3. **Go to Settings** → **Environment Variables**
4. **Add Each Variable**:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4`
   - Environment: **Production**, **Preview**, **Development** (select all)
5. **Click "Save"**
6. **Repeat for all variables above**

## 🔄 **After Adding Variables**

1. **Redeploy**: Go to Deployments → Click "..." → Redeploy
2. **Wait for deployment** to complete
3. **Test bot**: Send `/start` to @PushAuthBot
4. **Should work now!** ✅

## 🧪 **Test Commands**

After redeployment, test these:

```
/start → Should show welcome message
/balance → Should show wallet balance  
/chainsync → Should offer Web App access
/help → Should show command list
```

## 🔍 **Verify Environment Variables**

You can check if variables are set by looking at Vercel function logs:

1. Go to Vercel Dashboard → Functions
2. Click on a recent webhook call
3. Check logs for environment variable values

## ⚡ **Quick Fix Steps**

1. **Add TELEGRAM_BOT_TOKEN to Vercel** ← Most important!
2. **Add other environment variables**
3. **Redeploy the project**
4. **Test @PushAuthBot**

## 🎯 **Expected Result**

After adding environment variables and redeploying:
- ✅ Bot responds to `/start`
- ✅ Shows welcome message with Web App button
- ✅ All commands work correctly
- ✅ Web App authentication works
- ✅ User search functions properly

The bot should start responding immediately after the redeploy! 🚀