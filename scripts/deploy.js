async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Gas optimization: Set gas price and limit for deployment
  const deploymentOptions = {
    gasPrice: ethers.utils.parseUnits("3", "gwei"), // 3 gwei - more likely to be accepted
    gasLimit: 5000000 // Increased gas limit for deployment
  };

  const TicketNFT = await ethers.getContractFactory("EventTicketNFT");
  console.log("Deploying EventTicketNFT...");

  // Note: deploymentOptions should be passed as an overrides parameter, not as a constructor argument
  const ticketNFT = await TicketNFT.deploy(
    "EventTicketNFT",    // Token name
    "ETT",               // Token symbol
    1000,                // Max resale price (now uint128)
    1753939200,          // Lock timestamp (any future time)
    deployer.address,    // Initial owner passed to Ownable
    deploymentOptions    // This is passed as an overrides parameter to ethers.js, not to the constructor
  );

  await ticketNFT.deployed();

  const deploymentTxHash = ticketNFT.deployTransaction.hash;
  console.log("Deployment transaction hash:", deploymentTxHash);
  console.log("TicketNFT deployed at address:", ticketNFT.address);

  // Log gas used for deployment
  const deploymentReceipt = await ethers.provider.getTransactionReceipt(deploymentTxHash);
  console.log("Gas used for deployment:", deploymentReceipt.gasUsed.toString());
  console.log("Gas price used (gwei):", ethers.utils.formatUnits(ticketNFT.deployTransaction.gasPrice, "gwei"));
  console.log("Total cost (ETH):", ethers.utils.formatEther(deploymentReceipt.gasUsed.mul(ticketNFT.deployTransaction.gasPrice)));

  console.log("Remaining balance:", ethers.utils.formatEther(await deployer.getBalance()));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
