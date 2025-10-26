# 🏗️ ChainSync Architecture

## System Overview

ChainSync is a full-stack application combining Telegram bot, web interface, and blockchain integration.

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐                    ┌─────────────────────┐   │
│  │   Telegram Client   │                    │    Web Browser      │   │
│  │                     │                    │                     │   │
│  │  • iOS/Android      │                    │  • Desktop          │   │
│  │  • Desktop          │                    │  • Mobile           │   │
│  │  • Web              │                    │  • Tablet           │   │
│  │                     │                    │                     │   │
│  │  User sends:        │                    │  User visits:       │   │
│  │  /balance           │                    │  /social            │   │
│  │  /send 5 PC         │                    │  /marketplace       │   │
│  │  /faucet            │                    │  /profile           │   │
│  └──────────┬──────────┘                    └──────────┬──────────┘   │
│             │                                           │              │
└─────────────┼───────────────────────────────────────────┼──────────────┘
              │                                           │
              │                                           │
              ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TELEGRAM API                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  api.telegram.org                                                       │
│  • Receives user messages                                              │
│  • Sends bot responses                                                 │
│  • Handles webhooks                                                    │
│                                                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ HTTPS POST
                               │ (webhook)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (Vercel)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Application                            │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │  ┌─────────────────────┐         ┌─────────────────────┐        │ │
│  │  │   Frontend (SSR)    │         │   API Routes        │        │ │
│  │  │                     │         │   (Serverless)      │        │ │
│  │  │  • React Components │         │                     │        │ │
│  │  │  • Pages            │         │  Telegram:          │        │ │
│  │  │  • Styles           │         │  └─ webhook.js      │        │ │
│  │  │  • Client Logic     │         │                     │        │ │
│  │  │                     │         │  Wallet:            │        │ │
│  │  │  Pages:             │         │  ├─ balance/[id].js │        │ │
│  │  │  • /                │         │  ├─ send.js         │        │ │
│  │  │  • /social          │         │  ├─ faucet.js       │        │ │
│  │  │  • /marketplace     │         │  └─ generate.js     │        │ │
│  │  │  • /analytics       │         │                     │        │ │
│  │  │  • /profile         │         │  Debug:             │        │ │
│  │  │                     │         │  └─ test-rpc.js     │        │ │
│  │  └─────────────────────┘         └──────────┬──────────┘        │ │
│  │                                              │                   │ │
│  └──────────────────────────────────────────────┼───────────────────┘ │
│                                                 │                     │
│  ┌──────────────────────────────────────────────▼───────────────────┐ │
│  │                    Business Logic Layer                          │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │  ┌─────────────────────┐         ┌─────────────────────┐        │ │
│  │  │  Wallet Manager     │         │  Bot Handler        │        │ │
│  │  │                     │         │                     │        │ │
│  │  │  • Generate wallet  │         │  • Parse commands   │        │ │
│  │  │  • Sign transactions│         │  • Route messages   │        │ │
│  │  │  • Query balance    │         │  • Send responses   │        │ │
│  │  │  • Send tokens      │         │  • Handle callbacks │        │ │
│  │  │                     │         │                     │        │ │
│  │  │  generateWallet()   │         │  handleBotCommand() │        │ │
│  │  │  ├─ Hash TG ID      │         │  ├─ /start          │        │ │
│  │  │  ├─ Create wallet   │         │  ├─ /balance        │        │ │
│  │  │  └─ Return address  │         │  ├─ /send           │        │ │
│  │  │                     │         │  ├─ /faucet         │        │ │
│  │  └─────────────────────┘         │  └─ /help           │        │ │
│  │                                   └─────────────────────┘        │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ JSON-RPC
                               │ (ethers.js)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BLOCKCHAIN LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              Push Chain Donut Testnet (42101)                     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │  RPC Endpoint:                                                    │ │
│  │  https://evm.rpc-testnet-donut-node1.push.org/                   │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   RPC Node      │  │   Validator     │  │   Explorer      │ │ │
│  │  │                 │  │                 │  │                 │ │ │
│  │  │  • eth_call     │  │  • Consensus    │  │  • View txs     │ │
│  │  │  • eth_sendTx   │  │  • Block prod   │  │  • Search addr  │ │
│  │  │  • eth_getBalance│ │  • Finality     │  │  • Analytics    │ │
│  │  │  • eth_blockNum │  │                 │  │                 │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │                    State Storage                          │  │ │
│  │  ├───────────────────────────────────────────────────────────┤  │ │
│  │  │                                                           │  │ │
│  │  │  Account Balances:                                        │  │ │
│  │  │  0x293d9a... → 10.5 PC                                    │  │ │
│  │  │  0xBae1C4... → 1000 PC (faucet)                           │  │ │
│  │  │                                                           │  │ │
│  │  │  Transaction History:                                     │  │ │
│  │  │  • Block #1234: Transfer 5 PC                            │  │ │
│  │  │  • Block #1235: Faucet 10 PC                             │  │ │
│  │  │                                                           │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Balance Check Flow

```
User                Telegram        Webhook         API             RPC
 │                    │               │              │               │
 │  /balance          │               │              │               │
 ├───────────────────>│               │              │               │
 │                    │  POST update  │              │               │
 │                    ├──────────────>│              │               │
 │                    │               │ Extract TG ID│               │
 │                    │               ├─────────────>│               │
 │                    │               │              │ Generate addr │
 │                    │               │              │ Hash(TG ID)   │
 │                    │               │              │               │
 │                    │               │              │ getBalance()  │
 │                    │               │              ├──────────────>│
 │                    │               │              │               │
 │                    │               │              │ Return balance│
 │                    │               │              │<──────────────┤
 │                    │               │ Format msg   │               │
 │                    │               │<─────────────┤               │
 │                    │ sendMessage   │              │               │
 │                    │<──────────────┤              │               │
 │  Balance: 10.5 PC  │               │              │               │
 │<───────────────────┤               │              │               │
 │                    │               │              │               │
```

### 2. Faucet Request Flow

```
User                Telegram        Webhook         Faucet API      RPC
 │                    │               │              │               │
 │  /faucet           │               │              │               │
 ├───────────────────>│               │              │               │
 │                    │  POST update  │              │               │
 │                    ├──────────────>│              │               │
 │                    │               │ Extract TG ID│               │
 │                    │               ├─────────────>│               │
 │                    │               │              │ Generate addr │
 │                    │               │              │               │
 │                    │               │              │ Sign tx       │
 │                    │               │              │ (10 PC)       │
 │                    │               │              │               │
 │                    │               │              │ sendTransaction│
 │                    │               │              ├──────────────>│
 │                    │               │              │               │
 │                    │               │              │ Mine block    │
 │                    │               │              │ Update state  │
 │                    │               │              │               │
 │                    │               │              │ Return tx hash│
 │                    │               │              │<──────────────┤
 │                    │               │ Format msg   │               │
 │                    │               │<─────────────┤               │
 │                    │ sendMessage   │              │               │
 │                    │<──────────────┤              │               │
 │  ✅ 10 PC sent!    │               │              │               │
 │  TX: 0xabc...      │               │              │               │
 │<───────────────────┤               │              │               │
 │                    │               │              │               │
```

### 3. Send Transaction Flow

```
User A              Telegram        Webhook         Send API        RPC
 │                    │               │              │               │
 │ /send 5 PC to @B   │               │              │               │
 ├───────────────────>│               │              │               │
 │                    │  POST update  │              │               │
 │                    ├──────────────>│              │               │
 │                    │               │ Parse command│               │
 │                    │               │ Show confirm │               │
 │                    │ Confirm btn   │              │               │
 │                    │<──────────────┤              │               │
 │  [✅ Confirm]      │               │              │               │
 ├───────────────────>│               │              │               │
 │                    │ callback_query│              │               │
 │                    ├──────────────>│              │               │
 │                    │               │ Extract data │               │
 │                    │               ├─────────────>│               │
 │                    │               │              │ Get sender    │
 │                    │               │              │ wallet        │
 │                    │               │              │               │
 │                    │               │              │ Get recipient │
 │                    │               │              │ wallet        │
 │                    │               │              │               │
 │                    │               │              │ Sign tx       │
 │                    │               │              │ (5 PC)        │
 │                    │               │              │               │
 │                    │               │              │ sendTransaction│
 │                    │               │              ├──────────────>│
 │                    │               │              │               │
 │                    │               │              │ Verify balance│
 │                    │               │              │ Execute tx    │
 │                    │               │              │ Update state  │
 │                    │               │              │               │
 │                    │               │              │ Return tx hash│
 │                    │               │              │<──────────────┤
 │                    │               │ Format msg   │               │
 │                    │               │<─────────────┤               │
 │                    │ sendMessage   │              │               │
 │                    │<──────────────┤              │               │
 │  ✅ Sent 5 PC!     │               │              │               │
 │  TX: 0xdef...      │               │              │               │
 │<───────────────────┤               │              │               │
 │                    │               │              │               │
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Transport Security                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • HTTPS/TLS encryption                                   │ │
│  │  • Telegram Bot API security                              │ │
│  │  • Vercel edge network                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Layer 2: Application Security                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • Webhook signature validation                           │ │
│  │  • Input sanitization                                     │ │
│  │  • Rate limiting (faucet)                                 │ │
│  │  • Error handling (no data leaks)                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Layer 3: Wallet Security                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • Server-side key storage                                │ │
│  │  • Environment variable encryption                        │ │
│  │  • Deterministic generation (reproducible)                │ │
│  │  • No client-side key exposure                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Layer 4: Blockchain Security                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • Transaction signing                                    │ │
│  │  • Nonce management                                       │ │
│  │  • Gas estimation                                         │ │
│  │  • Consensus validation                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Models

### Wallet Generation

```javascript
// Deterministic wallet generation
function generateWallet(telegramId) {
  const masterSeed = process.env.MASTER_WALLET_SEED;
  
  // Hash: SHA-256(masterSeed + telegramId)
  const seed = crypto
    .createHash('sha256')
    .update(`${masterSeed}-${telegramId}`)
    .digest('hex');
  
  // Create wallet from seed
  const wallet = new ethers.Wallet(seed);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey // Never exposed to client
  };
}
```

### User State (In-Memory)

```javascript
// User database (temporary, in-memory)
const userDatabase = new Map();

// Structure:
{
  "@alice": 123456789,        // username → telegram ID
  "123456789": 123456789,     // ID → ID (for lookup)
  "@bob": 987654321,
  "987654321": 987654321
}
```

### Transaction Data

```javascript
// Transaction object
{
  from: "0x293d9a137E8b6deef3058B851855e355030585D0",
  to: "0xBae1C46A4886610C99a7d328C69F3fD3BA2656b8",
  value: ethers.parseEther("5.0"),  // 5 PC
  gasLimit: 21000,
  gasPrice: ethers.parseUnits("20", "gwei"),
  nonce: 42,
  chainId: 42101
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Vercel Platform                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌────────────────┐         ┌────────────────┐         │  │
│  │  │  Edge Network  │         │  Serverless    │         │  │
│  │  │                │         │  Functions     │         │  │
│  │  │  • CDN         │         │                │         │  │
│  │  │  • SSL/TLS     │         │  • API routes  │         │  │
│  │  │  • DDoS protect│         │  • Auto-scale  │         │  │
│  │  │  • Caching     │         │  • Cold start  │         │  │
│  │  └────────────────┘         └────────────────┘         │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │           Environment Variables                    │ │  │
│  │  │  • TELEGRAM_BOT_TOKEN (encrypted)                  │ │  │
│  │  │  • MASTER_WALLET_SEED (encrypted)                  │ │  │
│  │  │  • FAUCET_PRIVATE_KEY (encrypted)                  │ │  │
│  │  │  • PUSH_CHAIN_RPC_URL                              │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    GitHub Actions                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  git push → Vercel webhook → Auto deploy                │  │
│  │                                                          │  │
│  │  • Build Next.js                                         │  │
│  │  • Run tests                                             │  │
│  │  • Deploy to edge                                        │  │
│  │  • Update webhook                                        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Characteristics

### Response Times
- **Bot command:** < 3 seconds
- **Balance query:** < 2 seconds
- **Transaction:** < 5 seconds
- **Web page load:** < 1 second

### Scalability
- **Serverless functions:** Auto-scale to demand
- **CDN:** Global edge network
- **Blockchain:** Push Chain throughput
- **Concurrent users:** Unlimited (Vercel)

### Reliability
- **Uptime:** 99.9% (Vercel SLA)
- **Error handling:** Graceful degradation
- **Monitoring:** Vercel analytics
- **Logging:** Function logs

---

## 🔧 Technology Decisions

### Why Next.js?
- ✅ Server-side rendering
- ✅ API routes (serverless)
- ✅ File-based routing
- ✅ Built-in optimization
- ✅ Vercel integration

### Why Vercel?
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ Serverless functions
- ✅ Environment variables

### Why Push Chain?
- ✅ EVM-compatible
- ✅ Fast finality
- ✅ Low fees
- ✅ Testnet available
- ✅ Good documentation

### Why Custodial Wallets?
- ✅ Simplified UX
- ✅ No seed phrases
- ✅ Instant onboarding
- ✅ Mainstream friendly
- ❌ Trade-off: Centralization

---

## 🎯 Future Architecture

### Phase 2: Non-Custodial Option

```
User Device                    Server                  Blockchain
     │                           │                          │
     │ Generate wallet locally   │                          │
     │ (in browser/app)          │                          │
     │                           │                          │
     │ Sign transaction          │                          │
     │ (client-side)             │                          │
     │                           │                          │
     │ Send signed tx ──────────>│                          │
     │                           │                          │
     │                           │ Broadcast tx ───────────>│
     │                           │                          │
     │                           │<──── Confirmation ───────│
     │<──── Receipt ─────────────│                          │
     │                           │                          │
```

### Phase 3: Multi-Chain Support

```
                    ChainSync Backend
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Push Chain         Ethereum            Polygon
   (Primary)          (Bridge)            (Bridge)
        │                  │                  │
        └──────────────────┴──────────────────┘
                    Unified State
```

---

**For more details, see [README.md](README.md)**
