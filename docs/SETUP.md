# PushPay Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Push Chain Donut Testnet** access
3. **Twilio Account** for WhatsApp Business API
4. **Push Chain wallet** with testnet tokens

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd pushpay
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `PUSH_CHAIN_RPC_URL`: https://rpc-donut.push.network
- `PUSH_CHAIN_PRIVATE_KEY`: Your wallet private key
- `TWILIO_ACCOUNT_SID`: From Twilio Console
- `TWILIO_AUTH_TOKEN`: From Twilio Console
- `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp number

### 3. Get Push Chain Testnet Tokens

Visit the Push Chain faucet: https://faucet.push.org/

### 4. Deploy Universal Contract

```bash
node scripts/deploy.js
```

### 5. Configure Twilio WhatsApp

1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Set webhook URL to: `https://your-domain.com/webhook`
3. Enable WhatsApp sandbox for testing

### 6. Start the Server

```bash
npm run dev
```

## Testing the Bot

Send these messages to your Twilio WhatsApp number:

### Basic Commands

**Get Help:**
```
Hi
```

**Check Balance:**
```
Balance
```

**Send Payment:**
```
Send 2 ETH to +1234567890
Send 100 USDC to John
```

**Buy Crypto:**
```
Buy $50 USDC
Buy $100 ETH
```

## Push Chain Integration

### Universal App Features

PushPay leverages Push Chain's Universal App architecture:

1. **Cross-Chain Compatibility**: Users can send crypto from any supported chain
2. **Shared State**: Consistent balance and transaction history across chains
3. **Gas Abstraction**: Users don't need to hold $PC tokens
4. **One Deployment**: Single contract deployment reaches all chains

### Push Chain SDK Usage

```javascript
const { PushChainClient } = require('@pushchain/core');

const client = new PushChainClient({
  rpcUrl: 'https://rpc-donut.push.network',
  privateKey: process.env.PUSH_CHAIN_PRIVATE_KEY
});

// Send universal payment
await client.sendUniversalPayment({
  amount: 100,
  token: 'USDC',
  recipient: '+1234567890'
});
```

## Deployment to Production

### 1. Domain Setup

Get a domain and SSL certificate for webhook endpoints.

### 2. Twilio Production

1. Apply for Twilio WhatsApp Business API approval
2. Update webhook URLs to production domain
3. Configure message templates for compliance

### 3. Push Chain Mainnet

1. Switch RPC URL to Push Chain mainnet
2. Deploy contracts to mainnet
3. Update all references to mainnet addresses

### 4. Security

- Use environment variables for all secrets
- Implement rate limiting
- Add input validation and sanitization
- Set up monitoring and logging

## Troubleshooting

### Common Issues

**Webhook not receiving messages:**
- Check Twilio webhook URL configuration
- Ensure server is publicly accessible
- Verify SSL certificate

**Push Chain connection issues:**
- Confirm RPC URL is correct
- Check wallet has sufficient balance
- Verify private key format

**Payment failures:**
- Check recipient phone number is registered
- Verify token balance
- Review transaction logs

### Debug Mode

Enable debug logging:

```bash
DEBUG=pushpay:* npm run dev
```

## Support

- Push Chain Documentation: https://pushchain.github.io/push-chain-website/
- Twilio WhatsApp API: https://www.twilio.com/docs/whatsapp
- Project G.U.D Telegram: [Join support group]

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

Built for Push Chain's Project G.U.D Hackathon 🚀