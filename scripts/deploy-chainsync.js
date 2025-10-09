const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Deploying ChainSync Smart Contracts to Push Chain Testnet...\n');

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log('📝 Deploying contracts with account:', deployer.address);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'PC\n');

    if (balance < ethers.parseEther('0.1')) {
        console.error('❌ Insufficient balance for deployment. Need at least 0.1 PC');
        process.exit(1);
    }

    // Deploy UniversalPayments contract
    console.log('📦 Deploying UniversalPayments contract...');
    const UniversalPayments = await ethers.getContractFactory('UniversalPayments');
    const universalPayments = await UniversalPayments.deploy();
    await universalPayments.waitForDeployment();
    const paymentsAddress = await universalPayments.getAddress();
    console.log('✅ UniversalPayments deployed to:', paymentsAddress);

    // Deploy ChainSyncMarketplace contract
    console.log('📦 Deploying ChainSyncMarketplace contract...');
    const ChainSyncMarketplace = await ethers.getContractFactory('ChainSyncMarketplace');
    const marketplace = await ChainSyncMarketplace.deploy();
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log('✅ ChainSyncMarketplace deployed to:', marketplaceAddress);

    // Set up marketplace configuration
    console.log('\n⚙️ Configuring marketplace...');
    
    // Set fee recipient to deployer
    await marketplace.setFeeRecipient(deployer.address);
    console.log('✅ Fee recipient set to:', deployer.address);

    // Set platform fee to 2.5%
    await marketplace.setPlatformFee(250);
    console.log('✅ Platform fee set to: 2.5%');

    // Verify contracts on network
    console.log('\n🔍 Verifying contract deployment...');
    
    // Test UniversalPayments
    const paymentsStats = await universalPayments.getStats();
    console.log('📊 UniversalPayments stats:', {
        totalPayments: paymentsStats[0].toString(),
        totalGroupPayments: paymentsStats[1].toString(),
        totalRefunds: paymentsStats[2].toString()
    });

    // Test Marketplace
    const marketplaceFee = await marketplace.platformFee();
    console.log('📊 Marketplace fee:', marketplaceFee.toString(), 'basis points');

    // Save deployment information
    const deploymentInfo = {
        network: 'push-chain-testnet',
        chainId: (await deployer.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        contracts: {
            UniversalPayments: {
                address: paymentsAddress,
                deploymentHash: universalPayments.deploymentTransaction()?.hash
            },
            ChainSyncMarketplace: {
                address: marketplaceAddress,
                deploymentHash: marketplace.deploymentTransaction()?.hash
            }
        },
        configuration: {
            platformFee: '250', // 2.5%
            feeRecipient: deployer.address
        }
    };

    // Save to deployment.json
    const deploymentPath = path.join(__dirname, '..', 'deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentPath);

    // Update environment files
    const envUpdates = `
# ChainSync Smart Contract Addresses (Auto-generated)
MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}
PAYMENTS_CONTRACT_ADDRESS=${paymentsAddress}
DEPLOYER_ADDRESS=${deployer.address}
DEPLOYMENT_BLOCK=${await deployer.provider.getBlockNumber()}
`;

    // Update main .env.example
    const mainEnvPath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(mainEnvPath)) {
        let envContent = fs.readFileSync(mainEnvPath, 'utf8');
        
        // Remove old contract addresses if they exist
        envContent = envContent.replace(/# ChainSync Smart Contract Addresses.*?\n\n/s, '');
        
        // Add new addresses
        envContent += envUpdates;
        fs.writeFileSync(mainEnvPath, envContent);
        console.log('✅ Updated .env.example with contract addresses');
    }

    // Update chainsync .env.example
    const chainSyncEnvPath = path.join(__dirname, '..', 'chainsync', '.env.example');
    if (fs.existsSync(chainSyncEnvPath)) {
        let envContent = fs.readFileSync(chainSyncEnvPath, 'utf8');
        
        // Update contract addresses
        envContent = envContent.replace(
            /PUSH_CHAIN_CONTRACT_ADDRESS=.*/,
            `PUSH_CHAIN_CONTRACT_ADDRESS=${marketplaceAddress}`
        );
        
        // Add payments contract if not exists
        if (!envContent.includes('PAYMENTS_CONTRACT_ADDRESS')) {
            envContent += `\nPAYMENTS_CONTRACT_ADDRESS=${paymentsAddress}`;
        } else {
            envContent = envContent.replace(
                /PAYMENTS_CONTRACT_ADDRESS=.*/,
                `PAYMENTS_CONTRACT_ADDRESS=${paymentsAddress}`
            );
        }
        
        fs.writeFileSync(chainSyncEnvPath, envContent);
        console.log('✅ Updated chainsync/.env.example with contract addresses');
    }

    // Generate contract interaction examples
    const examplesPath = path.join(__dirname, '..', 'docs', 'CONTRACT_EXAMPLES.md');
    const examples = `# ChainSync Smart Contract Examples

## Contract Addresses
- **Marketplace**: \`${marketplaceAddress}\`
- **Payments**: \`${paymentsAddress}\`
- **Network**: Push Chain Testnet
- **Deployer**: \`${deployer.address}\`

## JavaScript Examples

### Register User
\`\`\`javascript
const chainsync = new ChainSyncClient();
await chainsync.registerUser('123456789', 'username', 'ipfs_hash');
\`\`\`

### List Product
\`\`\`javascript
await chainsync.listProduct(
    '123456789', // telegramId
    'Digital Art NFT',
    'Beautiful digital artwork',
    '0.1', // price in PC
    'art',
    'ipfs_image_hash'
);
\`\`\`

### Purchase Product
\`\`\`javascript
await chainsync.purchaseProduct('buyer_telegram_id', 1); // productId = 1
\`\`\`

### Send Payment
\`\`\`javascript
await chainsync.sendPayment(
    'sender_telegram_id',
    'recipient_telegram_id',
    '5', // amount in PC
    'Payment for services'
);
\`\`\`

## Direct Contract Calls

### Using ethers.js
\`\`\`javascript
const contract = new ethers.Contract(
    '${marketplaceAddress}',
    marketplaceABI,
    wallet
);

// Register user
await contract.registerUser('telegram_id', 'username', 'profile_hash');

// List product
await contract.listProduct(
    'Product Title',
    'Description',
    ethers.parseEther('0.1'),
    'category',
    'image_hash'
);
\`\`\`

## Web3 Integration

### Frontend Connection
\`\`\`javascript
// Connect to Push Chain
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);

// Switch to Push Chain Testnet
await provider.send("wallet_switchEthereumChain", [{
    chainId: "0x${(await deployer.provider.getNetwork()).chainId.toString(16)}"
}]);
\`\`\`

## Testing Commands

### Get User Info
\`\`\`bash
npx hardhat run scripts/test-contracts.js --network push-testnet
\`\`\`

### Verify Deployment
\`\`\`bash
npx hardhat verify ${marketplaceAddress} --network push-testnet
npx hardhat verify ${paymentsAddress} --network push-testnet
\`\`\`
`;

    fs.writeFileSync(examplesPath, examples);
    console.log('📚 Contract examples saved to:', examplesPath);

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Summary:');
    console.log('├── UniversalPayments:', paymentsAddress);
    console.log('├── ChainSyncMarketplace:', marketplaceAddress);
    console.log('├── Platform Fee: 2.5%');
    console.log('├── Fee Recipient:', deployer.address);
    console.log('└── Network: Push Chain Testnet');

    console.log('\n🔗 Next Steps:');
    console.log('1. Update your .env files with the contract addresses');
    console.log('2. Fund user wallets with test PC tokens');
    console.log('3. Test the marketplace functionality');
    console.log('4. Deploy the frontend and backend');
    console.log('5. Configure the Telegram bot with new addresses');

    console.log('\n💡 Useful Commands:');
    console.log('- Test contracts: npm run test:contracts');
    console.log('- Start backend: cd chainsync && npm run dev');
    console.log('- Start frontend: cd chainsync/client && npm run dev');
    console.log('- Start bot: node src/enhanced-telegram-bot.js');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });