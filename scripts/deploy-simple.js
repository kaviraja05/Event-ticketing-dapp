// Simple deployment script without Etherscan verification
const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy the contract
    console.log("Deploying EventTicketNFT...");
    const TicketNFT = await ethers.getContractFactory("EventTicketNFT");
    
    const ticketNFT = await TicketNFT.deploy(
      "EventTicketNFT",    // Token name
      "ETT",               // Token symbol
      1000,                // Max resale price (now uint128)
      1753939200,          // Lock timestamp (any future time)
      deployer.address     // Initial owner passed to Ownable
    );

    await ticketNFT.deployed();
    
    console.log("EventTicketNFT deployed to:", ticketNFT.address);
    console.log("Transaction hash:", ticketNFT.deployTransaction.hash);
    
    // Log deployment details for frontend configuration
    console.log("\n---------------------------------------------------");
    console.log("COPY THIS FOR YOUR FRONTEND CONFIGURATION:");
    console.log("---------------------------------------------------");
    console.log(`contractAddress: "${ticketNFT.address}"`);
    console.log("---------------------------------------------------\n");
    
    console.log("Deployment complete!");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
