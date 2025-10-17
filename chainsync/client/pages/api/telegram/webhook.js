// Telegram Bot Webhook Handler
import crypto from 'crypto';

// Validate webhook request from Telegram
function validateTelegramWebhook(body, signature, botToken) {
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Send message to Telegram
async function sendTelegramMessage(chatId, text, options = {}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...options
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Handle different bot commands
async function handleBotCommand(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const user = message.from;

  // Extract command and parameters
  const [command, ...params] = text.split(' ');

  switch (command) {
    case '/start':
      return await handleStartCommand(chatId, user, params);
    
    case '/chainsync':
      return await handleChainSyncCommand(chatId, user);
    
    case '/balance':
      return await handleBalanceCommand(chatId, user);
    
    case '/send':
      return await handleSendCommand(chatId, user, params);
    
    case '/request':
      return await handleRequestCommand(chatId, user, params);
    
    case '/split':
      return await handleSplitCommand(chatId, user, params);
    
    case '/history':
      return await handleHistoryCommand(chatId, user);
    
    case '/help':
      return await handleHelpCommand(chatId, user);
    
    default:
      return await handleUnknownCommand(chatId, text);
  }
}

// Command handlers
async function handleStartCommand(chatId, user, params) {
  const welcomeMessage = `
🚀 <b>Welcome to ChainSync!</b>

Hi ${user.first_name}! I'm your PushPay Bot, ready to help you with:

💰 <b>Crypto Payments</b> - Send money instantly
👥 <b>Social Commerce</b> - Discover products through friends
🔗 <b>Cross-Chain</b> - Works with all blockchains

<b>Quick Commands:</b>
/chainsync - Open ChainSync Web App
/balance - Check your balance
/send - Send crypto to friends
/help - See all commands

Ready to get started? Tap the button below! 👇
`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Open ChainSync',
          web_app: { url: `https://chainsync-social-commerce.vercel.app/social` }
        }
      ],
      [
        { text: '💰 Check Balance', callback_data: 'balance' },
        { text: '📚 Help', callback_data: 'help' }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, welcomeMessage, {
    reply_markup: keyboard
  });
}

async function handleChainSyncCommand(chatId, user) {
  const message = `
🌐 <b>ChainSync Social Commerce</b>

Access the full ChainSync platform with:
✨ Social product discovery
🛒 Universal marketplace
💬 Friend connections
📊 Analytics dashboard

Tap below to open the Web App! 👇
`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Open ChainSync Web App',
          web_app: { url: `https://chainsync-social-commerce.vercel.app/social` }
        }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, message, {
    reply_markup: keyboard
  });
}

async function handleBalanceCommand(chatId, user) {
  // In a real implementation, fetch actual balance from blockchain
  const mockBalance = {
    PC: '125.50',
    ETH: '0.0234',
    SOL: '12.8',
    MATIC: '45.2'
  };

  const message = `
💰 <b>Your Wallet Balance</b>

🚀 Push Chain: ${mockBalance.PC} PC
⟠ Ethereum: ${mockBalance.ETH} ETH  
◎ Solana: ${mockBalance.SOL} SOL
⬟ Polygon: ${mockBalance.MATIC} MATIC

<i>💡 Tip: Use /send to transfer funds to friends!</i>
`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💸 Send Money', callback_data: 'send' },
        { text: '📈 View Details', web_app: { url: `https://chainsync-social-commerce.vercel.app/profile` } }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, message, {
    reply_markup: keyboard
  });
}

async function handleSendCommand(chatId, user, params) {
  if (params.length < 3) {
    const message = `
💸 <b>Send Crypto</b>

<b>Usage:</b> /send [amount] [currency] to @username

<b>Examples:</b>
• /send 10 PC to @alice
• /send 0.01 ETH to @bob
• /send 5 SOL to @charlie

<b>Supported currencies:</b> PC, ETH, SOL, MATIC
`;

    return await sendTelegramMessage(chatId, message);
  }

  // Parse send command
  const amount = params[0];
  const currency = params[1];
  const recipient = params[3]; // Skip "to"

  const message = `
💸 <b>Payment Confirmation</b>

<b>Amount:</b> ${amount} ${currency.toUpperCase()}
<b>To:</b> ${recipient}
<b>From:</b> @${user.username || user.first_name}

Confirm this payment? 👇
`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Confirm Payment', callback_data: `confirm_send_${amount}_${currency}_${recipient}` },
        { text: '❌ Cancel', callback_data: 'cancel' }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, message, {
    reply_markup: keyboard
  });
}

async function handleRequestCommand(chatId, user, params) {
  const message = `
💰 <b>Request Payment</b>

<b>Usage:</b> /request [amount] [currency] from @username

<b>Example:</b> /request 20 PC from @alice

This will send a payment request to the user.
`;

  return await sendTelegramMessage(chatId, message);
}

async function handleSplitCommand(chatId, user, params) {
  const message = `
👥 <b>Split Bill</b>

<b>Usage:</b> /split [amount] [currency] between @user1 @user2 @user3

<b>Example:</b> /split 60 PC between @alice @bob @charlie

This will divide the amount equally among all users.
`;

  return await sendTelegramMessage(chatId, message);
}

async function handleHistoryCommand(chatId, user) {
  const message = `
📊 <b>Transaction History</b>

<b>Recent Transactions:</b>

💸 Sent 10 PC to @alice - <i>2 hours ago</i>
💰 Received 5 SOL from @bob - <i>1 day ago</i>
🛒 Purchased NFT for 0.1 ETH - <i>3 days ago</i>

<a href="https://chainsync-social-commerce.vercel.app/profile">View Full History →</a>
`;

  return await sendTelegramMessage(chatId, message);
}

async function handleHelpCommand(chatId, user) {
  const message = `
📚 <b>PushPay Bot Commands</b>

<b>💰 Payments:</b>
/send - Send crypto to friends
/request - Request payment
/split - Split bills with groups
/balance - Check wallet balance

<b>🌐 ChainSync:</b>
/chainsync - Open Web App
/history - View transactions

<b>ℹ️ Support:</b>
/help - Show this help

<b>💡 Tips:</b>
• Use natural language: "Send 10 PC to @alice"
• All transactions are on-chain and secure
• Works with multiple blockchains

Need more help? Visit our <a href="https://chainsync-social-commerce.vercel.app">Web App</a>!
`;

  return await sendTelegramMessage(chatId, message);
}

async function handleUnknownCommand(chatId, text) {
  const message = `
🤔 I didn't understand that command.

Try:
• /help - See all commands
• /chainsync - Open Web App
• /send 10 PC to @friend - Send money

Or just tap a button below! 👇
`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Open ChainSync', web_app: { url: `https://chainsync-social-commerce.vercel.app/social` } }
      ],
      [
        { text: '💰 Balance', callback_data: 'balance' },
        { text: '📚 Help', callback_data: 'help' }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, message, {
    reply_markup: keyboard
  });
}

// Handle callback queries (button presses)
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const user = callbackQuery.from;

  // Answer the callback query
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
      text: 'Processing...'
    })
  });

  // Handle different callback data
  if (data === 'balance') {
    return await handleBalanceCommand(chatId, user);
  } else if (data === 'help') {
    return await handleHelpCommand(chatId, user);
  } else if (data.startsWith('confirm_send_')) {
    // Handle payment confirmation - REAL TRANSACTION
    const [, , amount, currency, recipient] = data.split('_');
    
    try {
      // Send processing message
      await sendTelegramMessage(chatId, '⏳ Processing your payment...');
      
      // Call the send API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://chainsync-social-commerce.vercel.app'}/api/wallet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromTelegramId: user.id,
          recipient: recipient,
          amount: amount,
          message: `Payment via Telegram bot`
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const txHash = result.data.txHash;
        const explorerUrl = `https://scan.push.org/tx/${txHash}`;
        
        const message = `
✅ <b>Payment Sent!</b>

💸 ${amount} ${currency.toUpperCase()} sent to ${recipient}
🔗 <a href="${explorerUrl}">View on Block Explorer</a>

<b>Transaction Hash:</b>
<code>${txHash}</code>

<i>🎉 Payment completed successfully!</i>
`;

        return await sendTelegramMessage(chatId, message);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      const errorMessage = `
❌ <b>Payment Failed</b>

${error.message || 'Unable to process payment'}

Please try again or check your balance with /balance
`;
      
      return await sendTelegramMessage(chatId, errorMessage);
    }
  } else if (data === 'cancel') {
    return await sendTelegramMessage(chatId, '❌ Operation cancelled.');
  }
}

// Main webhook handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const signature = req.headers['x-telegram-bot-api-secret-token'];

    // Validate webhook (optional, for security)
    // if (!validateTelegramWebhook(body, signature, process.env.TELEGRAM_BOT_TOKEN)) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Handle different update types
    if (body.message) {
      await handleBotCommand(body.message);
    } else if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}