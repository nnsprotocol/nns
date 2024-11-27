import { ethers } from "hardhat";

async function run() {
  const [deployer] = await ethers.getSigners();

  console.log(deployer.address);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
