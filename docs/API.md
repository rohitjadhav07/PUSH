# PushPay API Documentation

## Overview

PushPay provides a RESTful API for managing universal crypto payments via WhatsApp integration with Push Chain.

## Base URL

```
Production: https://pushpay.vercel.app
Development: http://localhost:3000
```

## Authentication

Most endpoints are public, but admin endpoints require authentication.

```bash
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health Check

**GET** `/health`

Returns service status and basic information.

```json
{
  "status": "OK",
  "service": "PushPay Universal WhatsApp Bot",
  "version": "1.0.0",
  "network": "Push Chain Donut Testnet",
  "uptime": 3600
}
```

### WhatsApp Webhook

**POST** `/webhook`

Receives WhatsApp messages from Twilio.

**Headers:**
- `Content-Type: application/x-www-form-urlencoded`

**Body:**
```
Body=Send 2 ETH to +1234567890
From=whatsapp:+1234567890
```

### Payment Webhooks

#### Stripe Webhook

**POST** `/webhook/stripe`

Handles Stripe payment events.

**Headers:**
- `Stripe-Signature: <signature>`
- `Content-Type: application/json`

#### Razorpay Webhook

**POST** `/webhook/razorpay`

Handles Razorpay payment events.

**Headers:**
- `X-Razorpay-Signature: <signature>`
- `Content-Type: application/json`

#### Push Chain Webhook

**POST** `/webhook/pushchain`

Handles Push Chain transaction events.

```json
{
  "type": "payment_sent",
  "data": {
    "txHash": "0x...",
    "senderPhone": "+1234567890",
    "recipientPhone": "+1234567891",
    "amount": "2.0",
    "token": "ETH"
  }
}
```

### Analytics

**GET** `/analytics`

Returns analytics data and metrics.

```json
{
  "report": "📊 PushPay Analytics Report...",
  "metrics": {
    "totalUsers": 1250,
    "totalTransactions": 5430,
    "totalVolume": {
      "USDC": 125000,
      "ETH": 45.5
    }
  },
  "daily": {
    "date": "2024-01-15",
    "newUsers": 25,
    "transactions": 150,
    "activeUsers": 85
  }
}
```

### Admin Endpoints

#### Users

**GET** `/admin/users`

Returns user statistics.

```json
{
  "totalUsers": 1250,
  "activeUsers": 85
}
```

#### Network Info

**GET** `/admin/network`

Returns Push Chain network information.

```json
{
  "chainId": "1001",
  "name": "Push Chain Donut Testnet",
  "blockNumber": 12345,
  "gasPrice": "20 gwei"
}
```

## WhatsApp Commands

### Send Payment

```
Send <amount> <token> to <recipient>
```

**Examples:**
- `Send 2 ETH to +1234567890`
- `Send 100 USDC to John`
- `Send 0.5 SOL to +91987654321 for dinner`

### Buy Crypto

```
Buy <fiat_amount> <token>
Buy <fiat_amount> worth of <token>
```

**Examples:**
- `Buy $100 USDC`
- `Buy ₹5000 worth of ETH`
- `Buy €50 SOL`

### Split Bill

```
Split <amount> <token> <description> with <participants>
```

**Examples:**
- `Split 100 USDC dinner with +123456, +789012`
- `Split $50 taxi with Alice, Bob`

### Balance Check

```
Balance
Wallet
Bal
```

### Transaction History

```
History
Transactions
Show my transactions
```

### Refund

```
Refund my last payment
Refund transaction <tx_id>
```

### Registration

```
Register
Start
Signup
```

### Help

```
Help
Hi
Hello
```

## Error Responses

All errors return a JSON object with error details:

```json
{
  "error": "Payment failed",
  "message": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

- `INSUFFICIENT_BALANCE` - Not enough tokens for transaction
- `USER_NOT_REGISTERED` - Recipient not registered with PushPay
- `INVALID_AMOUNT` - Amount is zero, negative, or too large
- `UNSUPPORTED_TOKEN` - Token not supported
- `PAYMENT_FAILED` - Transaction failed on blockchain
- `REFUND_EXPIRED` - Refund period expired (24 hours)
- `RATE_LIMITED` - Too many requests

## Rate Limits

- WhatsApp webhook: 100 requests/minute per phone number
- API endpoints: 1000 requests/hour per IP
- Payment operations: 10 transactions/minute per user

## Supported Tokens

| Token | Name | Decimals | Network |
|-------|------|----------|---------|
| ETH | Ethereum | 18 | All EVM chains |
| USDC | USD Coin | 6 | All EVM chains |
| SOL | Solana | 9 | Solana |
| BTC | Bitcoin | 8 | Bitcoin |
| MATIC | Polygon | 18 | Polygon |

## Supported Fiat Currencies

| Currency | Symbol | Payment Methods |
|----------|--------|-----------------|
| USD | $ | Stripe (Card, Bank) |
| INR | ₹ | Razorpay (UPI, Card) |
| EUR | € | Stripe (SEPA, Card) |

## Webhooks

### Registering Webhooks

Contact support to register webhook URLs for:
- Payment confirmations
- User registrations
- Transaction updates
- Error notifications

### Webhook Security

All webhooks include signature verification:
- Stripe: `Stripe-Signature` header
- Razorpay: `X-Razorpay-Signature` header
- Push Chain: HMAC-SHA256 signature

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @pushpay/sdk
```

```javascript
const PushPay = require('@pushpay/sdk');

const client = new PushPay({
  apiKey: 'your_api_key',
  environment: 'production' // or 'sandbox'
});

// Send payment
await client.sendPayment({
  from: '+1234567890',
  to: '+1234567891',
  amount: 10,
  token: 'USDC'
});
```

### Python

```bash
pip install pushpay-python
```

```python
import pushpay

client = pushpay.Client(
    api_key='your_api_key',
    environment='production'
)

# Send payment
client.send_payment(
    from_phone='+1234567890',
    to_phone='+1234567891',
    amount=10,
    token='USDC'
)
```

## Support

- Documentation: https://docs.pushpay.app
- Support: support@pushpay.app
- Telegram: https://t.me/pushpay_support
- Status: https://status.pushpay.app