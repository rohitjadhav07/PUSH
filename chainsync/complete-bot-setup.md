# 🤖 Complete Telegram Bot Setup

## After Vercel Deployment

Once you get your Vercel URL (e.g., `https://chainsync-social-commerce.vercel.app`), complete these steps:

### 1. Configure Web App with @BotFather

Send to @BotFather:
```
/newapp
```

Then provide:
- **App Name**: ChainSync Social Commerce
- **App URL**: https://your-vercel-url.vercel.app/social
- **Description**: Universal social commerce platform with cross-chain payments

### 2. Set Bot Commands

Send to @BotFather:
```
/setcommands
```

Then paste:
```
start - Initialize ChainSync integration
balance - Check your wallet balance
send - Send cryptocurrency to a friend
request - Request payment from someone
split - Split a bill with friends
history - View transaction history
chainsync - Open ChainSync Web App
help - Get help with commands
```

### 3. Set Bot Description

```
/setdescription
ChainSync Bot - Your gateway to universal social commerce! Send crypto, discover products, and connect with friends across all blockchains. 🚀💰
```

### 4. Set About Text

```
/setabouttext
ChainSync enables universal commerce across all blockchains. Use this bot to send payments, split bills, and access the social commerce platform.
```

### 5. Set Webhook (Optional)

If you want bot commands to work:
```bash
curl -X POST "https://api.telegram.org/bot8064527547:AAH3n9fTMP215Zxmi93CrZvtxKVgQM5oex4/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-vercel-url.vercel.app/api/telegram/webhook"}'
```

### 6. Test Your Bot

1. Open @PushAuthBot in Telegram
2. Send `/start`
3. Tap "🚀 Open ChainSync" button
4. Should open your deployed Web App with real authentication!

## 🎉 Success Indicators

✅ Bot responds to `/start` command
✅ Web App button opens your Vercel deployment
✅ Authentication works in Telegram Web App
✅ User search finds real Telegram users
✅ Social features are fully functional

## 🔧 Troubleshooting

**Web App doesn't open:**
- Check HTTPS is working on your Vercel URL
- Verify Web App URL is set correctly with @BotFather

**Authentication fails:**
- Check TELEGRAM_BOT_TOKEN environment variable in Vercel
- Verify the token matches your bot

**Commands don't work:**
- Set up webhook (step 5 above)
- Check API routes are deployed correctly