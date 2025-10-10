#!/usr/bin/env node

/**
 * Telegram Bot Setup Script for ChainSync
 * 
 * This script helps you set up a real Telegram bot for ChainSync integration.
 * Run with: node setup-telegram-bot.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupTelegramBot() {
  console.log('\n🤖 ChainSync Telegram Bot Setup\n');
  console.log('This script will help you configure a real Telegram bot for ChainSync.\n');

  try {
    // Step 1: Get bot token
    console.log('📋 Step 1: Create a Telegram Bot');
    console.log('1. Open Telegram and search for @BotFather');
    console.log('2. Send /newbot command');
    console.log('3. Follow the instructions to create your bot');
    console.log('4. Copy the bot token\n');

    const botToken = await question('Enter your bot token: ');
    
    if (!botToken || !botToken.includes(':')) {
      throw new Error('Invalid bot token format');
    }

    // Step 2: Get bot username
    const botUsername = await question('Enter your bot username (without @): ');
    
    if (!botUsername) {
      throw new Error('Bot username is required');
    }

    // Step 3: Get domain
    console.log('\n📋 Step 2: Configure Web App');
    console.log('Your ChainSync app needs to be accessible via HTTPS for Telegram Web App to work.\n');
    
    const domain = await question('Enter your domain (e.g., chainsync.example.com): ');
    
    if (!domain) {
      throw new Error('Domain is required');
    }

    // Step 4: Update environment files
    console.log('\n📋 Step 3: Updating Configuration Files...\n');

    // Update server .env
    const serverEnvPath = path.join(__dirname, '.env');
    let serverEnvContent = fs.readFileSync(serverEnvPath, 'utf8');
    
    serverEnvContent = serverEnvContent.replace(
      /TELEGRAM_BOT_TOKEN=.*/,
      `TELEGRAM_BOT_TOKEN=${botToken}`
    );
    serverEnvContent = serverEnvContent.replace(
      /TELEGRAM_BOT_URL=.*/,
      `TELEGRAM_BOT_URL=https://t.me/${botUsername}`
    );
    
    if (!serverEnvContent.includes('TELEGRAM_BOT_USERNAME=')) {
      serverEnvContent += `\nTELEGRAM_BOT_USERNAME=${botUsername}\n`;
    } else {
      serverEnvContent = serverEnvContent.replace(
        /TELEGRAM_BOT_USERNAME=.*/,
        `TELEGRAM_BOT_USERNAME=${botUsername}`
      );
    }

    fs.writeFileSync(serverEnvPath, serverEnvContent);
    console.log('✅ Updated server/.env');

    // Update client .env.local
    const clientEnvPath = path.join(__dirname, 'client', '.env.local');
    let clientEnvContent = fs.readFileSync(clientEnvPath, 'utf8');
    
    clientEnvContent = clientEnvContent.replace(
      /NEXT_PUBLIC_TELEGRAM_BOT_URL=.*/,
      `NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/${botUsername}`
    );
    
    if (!clientEnvContent.includes('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=')) {
      clientEnvContent += `\nNEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${botUsername}\n`;
    } else {
      clientEnvContent = clientEnvContent.replace(
        /NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=.*/,
        `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${botUsername}`
      );
    }

    fs.writeFileSync(clientEnvPath, clientEnvContent);
    console.log('✅ Updated client/.env.local');

    // Step 5: Generate bot commands
    console.log('\n📋 Step 4: Bot Configuration');
    console.log('Copy and paste these commands to @BotFather to configure your bot:\n');

    const commands = [
      '/setcommands',
      `start - Initialize ChainSync integration`,
      `balance - Check your wallet balance`,
      `send - Send cryptocurrency to a friend`,
      `request - Request payment from someone`,
      `split - Split a bill with friends`,
      `history - View transaction history`,
      `help - Get help with commands`,
      `chainsync - Open ChainSync Web App`
    ].join('\n');

    console.log('🤖 Bot Commands:');
    console.log(commands);

    console.log('\n📱 Web App Configuration:');
    console.log(`/newapp`);
    console.log(`App Name: ChainSync Social Commerce`);
    console.log(`App URL: https://${domain}/social`);
    console.log(`Description: Universal social commerce platform with cross-chain payments`);

    console.log('\n🎨 Bot Settings:');
    console.log('/setdescription');
    console.log('ChainSync Bot - Your gateway to universal social commerce! Send crypto, discover products, and connect with friends across all blockchains. 🚀💰');

    console.log('\n/setabouttext');
    console.log('ChainSync enables universal commerce across all blockchains. Use this bot to send payments, split bills, and access the social commerce platform.');

    // Step 6: Create webhook setup script
    const webhookScript = `#!/usr/bin/env node

/**
 * Telegram Webhook Setup
 * Run this after deploying your app to set up webhooks
 */

const https = require('https');

const BOT_TOKEN = '${botToken}';
const WEBHOOK_URL = 'https://${domain}/api/telegram/webhook';

function setWebhook() {
  const url = \`https://api.telegram.org/bot\${BOT_TOKEN}/setWebhook?url=\${WEBHOOK_URL}\`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log('✅ Webhook set successfully!');
        console.log('Webhook URL:', WEBHOOK_URL);
      } else {
        console.error('❌ Failed to set webhook:', result.description);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error setting webhook:', err.message);
  });
}

setWebhook();
`;

    fs.writeFileSync(path.join(__dirname, 'set-webhook.js'), webhookScript);
    console.log('\n✅ Created set-webhook.js script');

    // Step 7: Final instructions
    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure your bot with @BotFather using the commands above');
    console.log('2. Deploy your ChainSync app to your domain with HTTPS');
    console.log('3. Run: node set-webhook.js (after deployment)');
    console.log('4. Test the integration by opening your bot in Telegram');
    console.log('\n🔧 Development Testing:');
    console.log('- Use ngrok or similar to expose localhost with HTTPS');
    console.log('- Update the webhook URL accordingly');
    console.log('\n📚 Documentation:');
    console.log('- Telegram Bot API: https://core.telegram.org/bots/api');
    console.log('- Telegram Web Apps: https://core.telegram.org/bots/webapps');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupTelegramBot();