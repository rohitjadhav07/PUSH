import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Push Chain Testnet configuration
    const PUSH_CHAIN_CONFIG = {
        chainId: '0xA455', // 42069 in hex
        chainName: 'Push Chain Testnet',
        nativeCurrency: {
            name: 'Push Coin',
            symbol: 'PC',
            decimals: 18
        },
        rpcUrls: [process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC_URL || 'https://evm.rpc-testnet-donut-node1.push.org/'],
        blockExplorerUrls: ['https://donut.push.network']
    };

    // Initialize provider
    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            
            // Check if already connected
            checkConnection();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                }
            };
        }
    }, []);

    const checkConnection = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    const web3Provider = new ethers.BrowserProvider(window.ethereum);
                    const web3Signer = await web3Provider.getSigner();
                    const network = await web3Provider.getNetwork();
                    
                    setProvider(web3Provider);
                    setSigner(web3Signer);
                    setAccount(accounts[0]);
                    setChainId(network.chainId.toString());
                    setIsConnected(true);
                }
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            disconnect();
        } else {
            setAccount(accounts[0]);
        }
    };

    const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16).toString());
        window.location.reload(); // Reload to ensure clean state
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('MetaMask is not installed. Please install MetaMask to continue.');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const web3Signer = await web3Provider.getSigner();
            const network = await web3Provider.getNetwork();

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(accounts[0]);
            setChainId(network.chainId.toString());
            setIsConnected(true);

            // Switch to Push Chain if not already connected
            if (network.chainId.toString() !== '42069') {
                await switchToPushChain();
            }

            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setError(error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const switchToPushChain = async () => {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            // Try to switch to Push Chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: PUSH_CHAIN_CONFIG.chainId }]
            });
        } catch (switchError) {
            // If the chain is not added, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [PUSH_CHAIN_CONFIG]
                    });
                } catch (addError) {
                    throw new Error('Failed to add Push Chain network');
                }
            } else {
                throw switchError;
            }
        }
    };

    const disconnect = () => {
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setChainId(null);
        setIsConnected(false);
        setError(null);
    };

    const getBalance = async (address = account) => {
        if (!provider || !address) return '0';
        
        try {
            const balance = await provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    };

    const sendTransaction = async (to, value, data = '0x') => {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        try {
            const tx = await signer.sendTransaction({
                to,
                value: ethers.parseEther(value.toString()),
                data
            });

            return await tx.wait();
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    };

    const signMessage = async (message) => {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        try {
            return await signer.signMessage(message);
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    };

    const getContract = (address, abi) => {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        return new ethers.Contract(address, abi, signer);
    };

    const isOnPushChain = () => {
        return chainId === '42069';
    };

    const value = {
        // State
        provider,
        signer,
        account,
        chainId,
        isConnected,
        isLoading,
        error,
        
        // Actions
        connectWallet,
        disconnect,
        switchToPushChain,
        getBalance,
        sendTransaction,
        signMessage,
        getContract,
        
        // Utilities
        isOnPushChain,
        PUSH_CHAIN_CONFIG
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};