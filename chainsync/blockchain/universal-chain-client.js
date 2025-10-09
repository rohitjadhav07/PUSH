const { ethers } = require('ethers');
const axios = require('axios');

class UniversalChainClient {
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.wallets = {};
    this.supportedChains = ['ethereum', 'polygon', 'base', 'solana', 'push'];
    
    this.initializeProviders();
  }

  initializeProviders() {
    try {
      // Ethereum
      if (this.config.ETHEREUM_RPC_URL) {
        this.providers.ethereum = new ethers.JsonRpcProvider(this.config.ETHEREUM_RPC_URL);
        console.log('✅ Ethereum provider initialized');
      }

      // Polygon
      if (this.config.POLYGON_RPC_URL) {
        this.providers.polygon = new ethers.JsonRpcProvider(this.config.POLYGON_RPC_URL);
        console.log('✅ Polygon provider initialized');
      }

      // Base
      if (this.config.BASE_RPC_URL) {
        this.providers.base = new ethers.JsonRpcProvider(this.config.BASE_RPC_URL);
        console.log('✅ Base provider initialized');
      }

      // Push Chain
      if (this.config.PUSH_CHAIN_RPC_URL) {
        this.providers.push = new ethers.JsonRpcProvider(this.config.PUSH_CHAIN_RPC_URL, {
          chainId: 42101,
          name: 'push-chain-donut-testnet',
          ensAddress: null
        });
        console.log('✅ Push Chain provider initialized');
      }

      // Initialize wallets if private key provided
      if (this.config.PUSH_CHAIN_PRIVATE_KEY) {
        Object.keys(this.providers).forEach(chain => {
          this.wallets[chain] = new ethers.Wallet(
            this.config.PUSH_CHAIN_PRIVATE_KEY, 
            this.providers[chain]
          );
        });
        console.log('✅ Universal wallets initialized');
      }

    } catch (error) {
      console.error('❌ Provider initialization error:', error);
    }
  }

  // Universal balance checking
  async getBalance(address, chain = 'push') {
    try {
      if (!this.providers[chain]) {
        throw new Error(`Chain ${chain} not supported`);
      }

      const balance = await this.providers[chain].getBalance(address);
      const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(6);
      
      console.log(`✅ Balance for ${address} on ${chain}: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      console.error(`❌ Balance check error on ${chain}:`, error);
      return '0.000000';
    }
  }

  // Universal payment processing
  async processPayment(paymentData) {
    const {
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount,
      currency,
      privateKey
    } = paymentData;

    try {
      console.log(`💸 Processing universal payment: ${amount} ${currency} from ${fromChain} to ${toChain}`);

      // If same chain, direct transfer
      if (fromChain === toChain) {
        return await this.directTransfer(fromChain, fromAddress, toAddress, amount, privateKey);
      }

      // Cross-chain transfer via Push Chain
      return await this.crossChainTransfer(paymentData);

    } catch (error) {
      console.error('❌ Universal payment error:', error);
      throw error;
    }
  }

  async directTransfer(chain, fromAddress, toAddress, amount, privateKey) {
    try {
      if (!this.providers[chain]) {
        throw new Error(`Chain ${chain} not supported`);
      }

      const wallet = new ethers.Wallet(privateKey, this.providers[chain]);
      
      // Check balance
      const balance = await this.providers[chain].getBalance(fromAddress);
      const amountWei = ethers.parseEther(amount.toString());
      
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. Have: ${ethers.formatEther(balance)}, Need: ${amount}`);
      }

      // Send transaction
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amountWei,
        gasLimit: 21000
      });

      console.log(`✅ Direct transfer sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        chain: chain
      };

    } catch (error) {
      console.error(`❌ Direct transfer error on ${chain}:`, error);
      throw error;
    }
  }

  async crossChainTransfer(paymentData) {
    const { fromChain, toChain, fromAddress, toAddress, amount, privateKey } = paymentData;

    try {
      console.log(`🌉 Cross-chain transfer: ${fromChain} → ${toChain}`);

      // Step 1: Lock tokens on source chain
      const lockTx = await this.lockTokens(fromChain, fromAddress, amount, privateKey);
      
      // Step 2: Mint tokens on destination chain (via Push Chain)
      const mintTx = await this.mintTokens(toChain, toAddress, amount);

      return {
        success: true,
        sourceTx: lockTx.txHash,
        destinationTx: mintTx.txHash,
        fromChain,
        toChain,
        amount
      };

    } catch (error) {
      console.error('❌ Cross-chain transfer error:', error);
      throw error;
    }
  }

  async lockTokens(chain, fromAddress, amount, privateKey) {
    // Simplified lock mechanism - in production this would use proper bridge contracts
    return await this.directTransfer(chain, fromAddress, this.getBridgeAddress(chain), amount, privateKey);
  }

  async mintTokens(chain, toAddress, amount) {
    // Simplified mint mechanism - in production this would use proper bridge contracts
    if (!this.wallets[chain]) {
      throw new Error(`No wallet available for ${chain}`);
    }

    const tx = await this.wallets[chain].sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
      gasLimit: 21000
    });

    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  }

  getBridgeAddress(chain) {
    // Bridge contract addresses for each chain
    const bridges = {
      ethereum: '0x1234567890123456789012345678901234567890',
      polygon: '0x2345678901234567890123456789012345678901',
      base: '0x3456789012345678901234567890123456789012',
      push: '0x4567890123456789012345678901234567890123'
    };
    
    return bridges[chain] || bridges.push;
  }

  // Token price fetching
  async getTokenPrice(symbol) {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
      return response.data[symbol]?.usd || 0;
    } catch (error) {
      console.error('❌ Price fetch error:', error);
      return 0;
    }
  }

  // Currency conversion
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const fromPrice = await this.getTokenPrice(fromCurrency.toLowerCase());
      const toPrice = await this.getTokenPrice(toCurrency.toLowerCase());
      
      if (fromPrice === 0 || toPrice === 0) {
        throw new Error('Unable to fetch token prices');
      }

      const usdValue = amount * fromPrice;
      const convertedAmount = usdValue / toPrice;
      
      console.log(`💱 Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(6)} ${toCurrency}`);
      return convertedAmount;

    } catch (error) {
      console.error('❌ Currency conversion error:', error);
      throw error;
    }
  }

  // Wallet generation
  async generateWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || null,
        publicKey: wallet.publicKey
      };
    } catch (error) {
      console.error('❌ Wallet generation error:', error);
      throw error;
    }
  }

  // Transaction status checking
  async getTransactionStatus(txHash, chain = 'push') {
    try {
      if (!this.providers[chain]) {
        throw new Error(`Chain ${chain} not supported`);
      }

      const receipt = await this.providers[chain].getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', confirmed: false };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmed: true,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        chain: chain
      };

    } catch (error) {
      console.error('❌ Transaction status error:', error);
      return { status: 'error', confirmed: false, error: error.message };
    }
  }

  // Gas estimation
  async estimateGas(chain, transaction) {
    try {
      if (!this.providers[chain]) {
        throw new Error(`Chain ${chain} not supported`);
      }

      const gasEstimate = await this.providers[chain].estimateGas(transaction);
      const gasPrice = await this.providers[chain].getFeeData();
      
      const totalGasCost = gasEstimate * gasPrice.gasPrice;
      const gasCostEth = ethers.formatEther(totalGasCost);

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice.toString(),
        totalCost: gasCostEth,
        chain: chain
      };

    } catch (error) {
      console.error('❌ Gas estimation error:', error);
      return null;
    }
  }

  // Network status
  async getNetworkStatus(chain = 'push') {
    try {
      if (!this.providers[chain]) {
        return { status: 'unavailable', chain };
      }

      const blockNumber = await this.providers[chain].getBlockNumber();
      const network = await this.providers[chain].getNetwork();
      
      return {
        status: 'connected',
        chain: chain,
        blockNumber: blockNumber,
        chainId: network.chainId.toString(),
        name: network.name
      };

    } catch (error) {
      console.error(`❌ Network status error for ${chain}:`, error);
      return { status: 'error', chain, error: error.message };
    }
  }

  // Get supported chains
  getSupportedChains() {
    return this.supportedChains.map(chain => ({
      name: chain,
      available: !!this.providers[chain],
      symbol: this.getChainSymbol(chain)
    }));
  }

  getChainSymbol(chain) {
    const symbols = {
      ethereum: 'ETH',
      polygon: 'MATIC',
      base: 'ETH',
      solana: 'SOL',
      push: 'PC'
    };
    return symbols[chain] || 'UNKNOWN';
  }

  // Cleanup
  async disconnect() {
    Object.keys(this.providers).forEach(chain => {
      if (this.providers[chain] && this.providers[chain].destroy) {
        this.providers[chain].destroy();
      }
    });
    
    this.providers = {};
    this.wallets = {};
    console.log('✅ Universal chain client disconnected');
  }
}

module.exports = UniversalChainClient;