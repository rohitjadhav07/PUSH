# 🚀 Real Telegram Authentication Setup Guide

## 📋 Overview

This guide will help you set up **real Telegram authentication** for ChainSync, replacing the demo mode with actual Telegram Web App integration.

## 🛠️ Prerequisites

- Telegram account
- Domain with HTTPS (required for Telegram Web App)
- Node.js environment

## 📱 Step 1: Create Telegram Bot

### 1.1 Create Bot with BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "ChainSync Bot")
4. Choose a username (e.g., "ChainSyncCommerceBot")
5. Copy the **bot token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Configure Bot Settings

Send these commands to @BotFather:

```
/setdescription
ChainSync Bot - Your gateway to universal social commerce! Send crypto, discover products, and connect with friends across all blockchains. 🚀💰

/setabouttext
ChainSync enables universal commerce across all blockchains. Use this bot to send payments, split bills, and access the social commerce platform.

/setcommands
start - Initialize ChainSync integration
balance - Check your wallet balance
send - Send cryptocurrency to a friend
request - Request payment from someone
split - Split a bill with friends
history - View transaction history
chainsync - Open ChainSync Web App
help - Get help with commands
```

## 🌐 Step 2: Set Up Web App

### 2.1 Configure Web App with BotFather

```
/newapp
```

Then provide:
- **App Name**: ChainSync Social Commerce
- **App URL**: `https://yourdomain.com/social`
- **Description**: Universal social commerce platform with cross-chain payments

### 2.2 Update Environment Variables

Run the setup script:

```bash
node setup-telegram-bot.js
```

Or manually update your `.env` files:

**Server `.env`:**
```env
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
TELEGRAM_BOT_URL=https://t.me/YourBotUsername
TELEGRAM_BOT_USERNAME=YourBotUsername
```

**Client `.env.local`:**
```env
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/YourBotUsername
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername
```

## 🔧 Step 3: Deploy with HTTPS

### 3.1 Production Deployment

Deploy your ChainSync app to a domain with HTTPS. Options include:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Railway**: `railway up`
- **Custom server**: Use nginx with SSL certificate

### 3.2 Development with HTTPS

For local development, use ngrok or similar:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, expose with HTTPS
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update your bot's Web App URL.

## 🔗 Step 4: Set Up Webhook

After deployment, set up the webhook:

```bash
node set-webhook.js
```

Or manually:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

## ✅ Step 5: Test Real Authentication

### 5.1 Test in Telegram

1. Open your bot in Telegram
2. Send `/start` command
3. Tap "🚀 Open ChainSync" button
4. The Web App should open with real authentication

### 5.2 Verify Authentication Flow

The real authentication process:

1. **User opens Web App** → Telegram provides `initData`
2. **Client validates** → Sends `initData` to `/api/telegram/validate`
3. **Server validates** → Verifies HMAC signature with bot token
4. **Authentication success** → Returns validated user data
5. **User logged in** → Can access all features

## 🔒 Security Features

### Data Validation
- ✅ HMAC-SHA256 signature verification
- ✅ Timestamp validation (24-hour window)
- ✅ Bot token verification
- ✅ User data integrity checks

### Privacy Protection
- 🔐 No sensitive data in frontend
- 📱 Secure API endpoints
- 🛡️ Proper session management
- 🔄 Automatic token refresh

## 🐛 Troubleshooting

### Common Issues

**1. "Not running in Telegram Web App"**
- Ensure you're opening the app through Telegram bot
- Check that Web App URL is configured correctly
- Verify HTTPS is working

**2. "Invalid Telegram authentication data"**
- Check bot token in environment variables
- Verify webhook is set up correctly
- Ensure initData is being passed properly

**3. "Authentication failed"**
- Check server logs for detailed errors
- Verify API endpoints are accessible
- Test webhook with curl

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('telegram_debug', 'true');
```

### Test Commands

Test your bot with these commands:

```
/start - Should show welcome message with Web App button
/chainsync - Should open Web App directly
/balance - Should show mock balance
/help - Should show all commands
```

## 📊 Monitoring

### Bot Analytics

Monitor your bot usage:

1. Check @BotFather for basic stats
2. Implement custom analytics in webhook handler
3. Monitor API endpoint usage
4. Track user authentication success rates

### Error Logging

Add proper error logging:

```javascript
// In your API routes
console.error('Telegram auth error:', {
  error: error.message,
  userId: user?.id,
  timestamp: new Date().toISOString()
});
```

## 🚀 Advanced Features

### Custom Keyboards

Add interactive keyboards to your bot:

```javascript
const keyboard = {
  inline_keyboard: [
    [
      { text: '🚀 Open ChainSync', web_app: { url: 'https://yourdomain.com/social' } }
    ],
    [
      { text: '💰 Balance', callback_data: 'balance' },
      { text: '📚 Help', callback_data: 'help' }
    ]
  ]
};
```

### Webhook Security

Add webhook validation:

```javascript
function validateWebhook(body, signature, botToken) {
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

## 📚 Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)
- [Webhook Guide](https://core.telegram.org/bots/webhooks)

## 🎉 Success!

Once set up correctly, your users will have:

- ✅ **Real Telegram Authentication** - Secure login with Telegram accounts
- ✅ **User Search** - Find friends by username/phone
- ✅ **Social Features** - Connect and share with Telegram network
- ✅ **Bot Integration** - Full PushPay Bot functionality
- ✅ **Cross-Platform** - Works on mobile and desktop

Your ChainSync platform now has production-ready Telegram integration! 🚀

---

**Need Help?** 
- 📧 Email: support@chainsync.com
- 💬 Telegram: @ChainSyncSupport
- 🐛 Issues: GitHub repository