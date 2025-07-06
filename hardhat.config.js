require('@nomiclabs/hardhat-ethers'); // Add this line at the top of your config
require('dotenv').config(); // Load environment variables from .env file
// Uncomment the line below after installing the package with: npm install --save-dev @nomiclabs/hardhat-etherscan
// require('@nomiclabs/hardhat-etherscan'); // Add Etherscan verification support

// Get private key from environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
// Get Infura or Alchemy API key from environment variable
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/your-api-key";

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337, // Local network's chain ID
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111, // Sepolia's chain ID
      gasPrice: 3000000000, // 3 gwei in wei (still lower than default but more likely to be accepted)
      gas: 5000000, // Increased gas limit for deployment
      timeout: 1000000
    },
  },
  // Uncomment this section after installing @nomiclabs/hardhat-etherscan
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY || "", // Your Etherscan API key
  // },
};
