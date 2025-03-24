import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WordMatchAchievement contract...");
  
  const WordMatchAchievement = await ethers.getContractFactory("WordMatchAchievement");
  const nft = await WordMatchAchievement.deploy();

  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`WordMatchAchievement deployed to: ${address}`);
  console.log("Waiting for 5 block confirmations...");
  
  // Wait for 5 block confirmations
  await nft.deploymentTransaction()?.wait(5);
  
  console.log("Contract deployment confirmed!");
  console.log("You can now verify the contract on Basescan");
  console.log(`npx hardhat verify --network base-goerli ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 