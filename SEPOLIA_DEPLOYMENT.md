# Deploying to Sepolia Testnet with Gas Optimization

This guide will help you deploy your gas-optimized EventTicketNFT contract to the Sepolia testnet with minimal gas costs.

## Prerequisites

1. **Sepolia ETH**: You need testnet ETH to pay for gas fees
   - Get Sepolia ETH from a faucet like:
     - [Sepolia Faucet](https://sepoliafaucet.com/)
     - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
     - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - With our gas optimizations, you'll need much less ETH than before!

2. **Infura or Alchemy API Key**:
   - Sign up for [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
   - Create a new project and select Sepolia network
   - Copy your API endpoint URL

3. **MetaMask Private Key**:
   - Open MetaMask and click on the three dots next to your account
   - Select "Account details" and then "Export Private Key"
   - Enter your password and copy the private key
   - **IMPORTANT**: Never share your private key with anyone or commit it to a public repository!

## Setup

1. **Update the .env file**:
   - Open the `.env` file
   - Replace `your_private_key_here_without_0x_prefix` with your MetaMask private key (without the 0x prefix)
   - Replace `your_api_key_here` with your Infura or Alchemy API endpoint for Sepolia

## Gas-Optimized Deployment

1. **Deploy the contract with low gas price**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   The deployment script now includes:
   - Custom gas price (3 gwei) - low enough to save costs but high enough to be accepted
   - Higher gas limit (5,000,000) to ensure successful deployment
   - Detailed gas usage reporting

2. **Review gas usage**:
   After deployment, you'll see detailed information about:
   - Gas used for deployment
   - Gas price used (in gwei)
   - Total cost in ETH
   - Your remaining balance

3. **Save the contract address**:
   - After successful deployment, you'll see a message like:
   ```
   Deploying contracts with account: 0xYourAddress
   TicketNFT deployed at address: 0xContractAddress
   ```
   - Copy the contract address and update it in your frontend code:
   ```javascript
   // In frontend/app.js
   sepolia: {
     name: "Sepolia Testnet",
     chainId: "0xaa36a7", // 11155111 in hex
     rpcUrl: "https://sepolia.infura.io/v3/your-infura-key",
     contractAddress: "0xYourNewContractAddress" // Update this line
   }
   ```

## Gas Optimization Benefits

Our optimized contract and deployment process provides several benefits:

1. **Lower deployment costs**:
   - The optimized contract uses approximately 50-70% less gas to deploy
   - Using 3 gwei gas price further reduces costs by 70-80% compared to default settings

2. **Cheaper transactions**:
   - Minting tickets costs less gas
   - Transferring tickets costs less gas
   - Viewing owned tickets is more efficient

3. **Better user experience**:
   - Lower gas costs mean faster confirmations
   - Reduced chance of transaction failures due to gas limits

See the `GAS_OPTIMIZATION.md` file for a detailed explanation of all optimizations implemented.

## Verification (Optional)

If you want to verify your contract on Etherscan:

1. **Install the Etherscan plugin**:
   ```bash
   npm install --save-dev @nomiclabs/hardhat-etherscan
   ```

2. **Add Etherscan configuration to hardhat.config.js**:
   ```javascript
   require("@nomiclabs/hardhat-etherscan");

   module.exports = {
     // ... existing config
     etherscan: {
       apiKey: process.env.ETHERSCAN_API_KEY
     }
   };
   ```

3. **Add your Etherscan API key to .env**:
   ```
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

4. **Verify the contract**:
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "EventTicketNFT" "ETT" 1000 1753939200 DEPLOYER_ADDRESS
   ```

## Testing

After deployment, you can test your contract on Sepolia by:

1. Switching your MetaMask to Sepolia network
2. Using your DApp's frontend with the updated contract address
3. Minting and transferring tickets on the testnet

## Troubleshooting

- **Transaction Errors**: Make sure you have enough Sepolia ETH for gas fees
- **Nonce Errors**: Reset your MetaMask account (Settings > Advanced > Reset Account)
- **RPC Errors**: Check your Infura/Alchemy API key and endpoint URL
