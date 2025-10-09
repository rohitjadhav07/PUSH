require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    pushchain: {
      url: process.env.PUSH_CHAIN_RPC_URL || "https://evm.rpc-testnet-donut-node1.push.org/",
      accounts: process.env.PUSH_CHAIN_PRIVATE_KEY ? [process.env.PUSH_CHAIN_PRIVATE_KEY] : [],
      chainId: 42101, // Push Chain Donut Testnet chain ID
      gasPrice: 20000000000, // 20 gwei
    }
  },
  etherscan: {
    apiKey: {
      pushchain: "no-api-key-needed"
    },
    customChains: [
      {
        network: "pushchain",
        chainId: 42101,
        urls: {
          apiURL: "https://donut.push.network/api",
          browserURL: "https://donut.push.network"
        }
      }
    ]
  }
};