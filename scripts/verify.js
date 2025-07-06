const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const contractAddress = "0xA56EE7fAF502Ff8821Ec46BE65A02Cf0b7834cD5";
  
  console.log("Verifying contract on Etherscan...");
  
  // Get the constructor arguments used for deployment
  const [deployer] = await ethers.getSigners();
  
  // Verify the contract
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        "EventTicketNFT",    // Token name
        "ETT",               // Token symbol
        1000,                // Max resale price (uint128)
        1753939200,          // Lock timestamp (any future time)
        deployer.address     // Initial owner passed to Ownable
      ],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
