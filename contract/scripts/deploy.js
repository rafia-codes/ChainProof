import hre from 'hardhat';

async function main() {
  console.log("Deploying contract to localhost...");

  const verification = await hre.ethers.getContractFactory("Verification");

  console.log("Waiting for deployment to be mined...");
  const contract = await verification.deploy();

  await contract.waitForDeployment();

  console.log("Deployed contract address:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });