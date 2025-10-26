# 🚀 ChainSync - Social Commerce with Telegram Payments

[![Next.js](https://img.shields.io/badge/Next.js-13.5.4-black)](https://nextjs.org/)
[![Push Chain](https://img.shields.io/badge/Push%20Chain-Testnet-purple)](https://push.org/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot%20Active-blue)](https://t.me/PushAuthBot)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://chainsync-social-commerce.vercel.app)

> **Social commerce platform with instant crypto payments through Telegram**

🌐 **Live Demo:** [chainsync-social-commerce.vercel.app](https://chainsync-social-commerce.vercel.app)  
🤖 **Telegram Bot:** [@PushAuthBot](https://t.me/PushAuthBot)  
⛓️ **Blockchain:** Push Chain Donut Testnet (Chain ID: 42101)

---

## 🎯 What is ChainSync?

ChainSync combines **social commerce** with **blockchain payments** through a Telegram bot. Users can:

- 🛍️ **Discover products** through social connections
- 💸 **Send crypto instantly** via Telegram commands
- 🎁 **Get test tokens** from the faucet
- 👥 **Share purchases** with friends
- ⚡ **Pay on-chain** with zero friction

**Key Innovation:** Making crypto payments as easy as sending a text message.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Telegram Bot    │              │   Web App        │        │
│  │  @PushAuthBot    │◄────────────►│   (Next.js)      │        │
│  │                  │   Deep Link  │                  │        │
│  │  • /start        │              │  • Marketplace   │        │
│  │  • /balance      │              │  • Social Feed   │        │
│  │  • /send         │              │  • Analytics     │        │
│  │  • /faucet       │              │  • Profile       │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                  │
└───────────┼─────────────────────────────────┼──────────────────┘
            │                                 │
            │         ┌───────────────────────┘
            │         │
            ▼         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Vercel)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (Next.js API)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  /api/telegram/webhook     ← Telegram updates           │  │
│  │  /api/wallet/balance/[id]  ← Get wallet balance         │  │
│  │  /api/wallet/send          ← Send transactions          │  │
│  │  /api/wallet/faucet        ← Request test tokens        │  │
│  │  /api/wallet/generate      ← Generate wallet            │  │
│  │  /api/debug/test-rpc       ← Test RPC connection        │  │
│  │                                                          │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │           Wallet Generation System                      │  │
│  │  • Deterministic from Telegram ID                       │  │
│  │  • SHA-256 hash with master seed                        │  │
│  │  • Custodial (server-side keys)                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Push Chain Donut Testnet (Chain ID: 42101)      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  RPC: https://evm.rpc-testnet-donut-node1.push.org/     │  │
│  │  Explorer: https://donut.push.network                   │  │
│  │                                                          │  │
│  │  • Native token: PC (Push Coin)                         │  │
│  │  • EVM-compatible                                        │  │
│  │  • Fast finality                                         │  │
│  │  • Low gas fees                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User sends /balance                                            │
│       ↓                                                         │
│  Telegram → Webhook → API → Generate Wallet → Query RPC        │
│       ↓                                                         │
│  RPC returns balance → Format response → Send to Telegram      │
│       ↓                                                         │
│  User sees balance in chat                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 Telegram Bot Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Welcome message & setup | `/start` |
| `/balance` | Check wallet balance | `/balance` |
| `/faucet` | Get 10 PC test tokens | `/faucet` |
| `/send` | Send crypto to friends | `/send 5 PC to @alice` |
| `/request` | Request payment | `/request 10 PC from @bob` |
| `/chainsync` | Open web app | `/chainsync` |
| `/help` | Show all commands | `/help` |

### 🌐 Web Application

- **Social Commerce Feed** - Discover products through friends
- **Marketplace** - Browse and list products
- **Analytics Dashboard** - Track sales and engagement
- **User Profiles** - Manage wallet and connections
- **Responsive Design** - Works on all devices

### ⛓️ Blockchain Integration

- **Real Transactions** - All payments on Push Chain
- **Deterministic Wallets** - Generated from Telegram ID
- **Instant Confirmation** - Fast block times
- **Low Fees** - Minimal gas costs
- **Explorer Integration** - Verify all transactions

---

## 🚀 Quick Start

### Try the Bot (30 seconds)

1. Open Telegram
2. Search for `@PushAuthBot`
3. Send `/start`
4. Send `/faucet` to get test tokens
5. Send `/balance` to see your wallet

### Run Locally

```bash
# Clone repository
git clone https://github.com/rohitjadhav07/PUSH.git
cd PUSH/chainsync/client

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in `chainsync/client/`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Push Chain RPC
PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_PUSH_CHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/

# Wallet System
MASTER_WALLET_SEED=chainsync-universal-commerce-2025
FAUCET_PRIVATE_KEY=your_faucet_private_key_here

# API URL
NEXT_PUBLIC_API_URL=https://chainsync-social-commerce.vercel.app
```

### Vercel Deployment

1. **Connect GitHub repo** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - automatic on push to main
4. **Set webhook** for Telegram bot:
   ```bash
   node chainsync/set-webhook.js https://your-vercel-url.vercel.app
   ```

---

## 📁 Project Structure

```
PUSH/
├── chainsync/
│   ├── client/                    # Next.js web application
│   │   ├── components/            # React components
│   │   │   ├── Navbar.js         # Navigation bar
│   │   │   ├── Footer.js         # Footer component
│   │   │   ├── ProductCard.js    # Product display
│   │   │   └── PushPayBotSection.js  # Bot integration
│   │   ├── pages/                # Next.js pages
│   │   │   ├── index.js          # Homepage
│   │   │   ├── social.js         # Social commerce
│   │   │   ├── marketplace.js    # Product listings
│   │   │   ├── analytics.js      # Analytics dashboard
│   │   │   ├── profile.js        # User profile
│   │   │   └── api/              # API routes
│   │   │       ├── telegram/
│   │   │       │   └── webhook.js    # Bot webhook handler
│   │   │       ├── wallet/
│   │   │       │   ├── balance/[telegramId].js  # Get balance
│   │   │       │   ├── send.js       # Send transaction
│   │   │       │   ├── faucet.js     # Faucet endpoint
│   │   │       │   └── generate.js   # Generate wallet
│   │   │       └── debug/
│   │   │           └── test-rpc.js   # RPC test
│   │   ├── styles/               # CSS styles
│   │   └── public/               # Static assets
│   ├── test-bot.js               # Bot testing script
│   ├── test-balance-api.js       # API testing script
│   └── set-webhook.js            # Webhook setup
├── contracts/                     # Smart contracts
├── deployment.json               # Deployment info
├── PROJECT_STATUS.md             # Project status
├── SUBMISSION_CHECKLIST.md       # Submission guide
└── README.md                     # This file
```

---

## 🧪 Testing

### Test Bot Status
```bash
cd chainsync
node test-bot.js
```

### Test Balance API
```bash
cd chainsync
node test-balance-api.js
```

### Test RPC Connection
Visit: `https://chainsync-social-commerce.vercel.app/api/debug/test-rpc`

### Manual Testing
1. Send `/start` to @PushAuthBot
2. Send `/balance` - should show wallet
3. Send `/faucet` - should receive tokens
4. Send `/balance` - should show updated balance

---

## 🔐 Security

### Wallet System
- **Deterministic Generation** - Same Telegram ID = Same wallet
- **Server-Side Keys** - Private keys never exposed to client
- **Custodial Model** - Simplified UX for mainstream users
- **Secure Seed** - Master seed stored in environment variables

### API Security
- **Webhook Validation** - Verify Telegram requests
- **Rate Limiting** - Prevent abuse (faucet, etc.)
- **Input Validation** - Sanitize all user inputs
- **Error Handling** - No sensitive data in error messages

---

## 📊 Tech Stack

### Frontend
- **Next.js 13.5.4** - React framework
- **React 18.2.0** - UI library
- **Tailwind CSS 3.3.3** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless functions
- **Vercel** - Hosting & deployment
- **Node.js** - Runtime environment

### Blockchain
- **Push Chain** - EVM-compatible blockchain
- **ethers.js 6.8.0** - Ethereum library
- **Chain ID: 42101** - Donut Testnet

### Bot
- **Telegram Bot API** - Bot framework
- **Webhook** - Real-time updates
- **Natural Language** - Command parsing

---

## 🎯 Use Cases

### For Users
- **Easy Payments** - Send crypto like texting
- **No App Download** - Works in Telegram
- **Social Discovery** - Find products through friends
- **Instant Transactions** - Fast blockchain confirmations

### For Merchants
- **Global Reach** - Sell to anyone with Telegram
- **Low Fees** - Minimal transaction costs
- **Social Marketing** - Viral product sharing
- **Analytics** - Track sales and engagement

### For Developers
- **Open API** - Build on ChainSync
- **Webhook Integration** - Real-time events
- **Smart Contracts** - Extend functionality
- **Documentation** - Comprehensive guides

---

## 🚧 Known Limitations

- **Testnet Only** - Currently on Push Chain Donut Testnet
- **Custodial Wallets** - Server holds private keys
- **In-Memory Database** - User data not persisted (demo)
- **Limited Tokens** - Only PC token supported
- **Mock Data** - Some features use placeholder data

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Telegram bot with basic commands
- ✅ Web application
- ✅ Push Chain integration
- ✅ Wallet generation
- ✅ Faucet system

### Phase 2 (Next)
- [ ] Non-custodial wallet option
- [ ] Multi-token support
- [ ] Real product listings
- [ ] User authentication
- [ ] Persistent database

### Phase 3 (Future)
- [ ] Mainnet deployment
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Merchant tools
- [ ] Payment splitting

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Live Demo:** [chainsync-social-commerce.vercel.app](https://chainsync-social-commerce.vercel.app)
- **Telegram Bot:** [@PushAuthBot](https://t.me/PushAuthBot)
- **GitHub:** [rohitjadhav07/PUSH](https://github.com/rohitjadhav07/PUSH)
- **Explorer:** [donut.push.network](https://donut.push.network)

---

## 🙏 Acknowledgments

- **Push Protocol** - For Push Chain infrastructure
- **Telegram** - For bot platform
- **Vercel** - For hosting
- **Next.js** - For framework

---

<div align="center">

**Built with ❤️ for the future of social commerce**

[⭐ Star on GitHub](https://github.com/rohitjadhav07/PUSH) • [🐛 Report Bug](https://github.com/rohitjadhav07/PUSH/issues) • [🚀 Try Demo](https://chainsync-social-commerce.vercel.app)

</div>
