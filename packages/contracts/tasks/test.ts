0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266;

import { formatEther, parseEther } from "ethers";
import { task } from "hardhat/config";

task("send-eth")
  .addOptionalParam("from", "Send ETH from")
  .addParam("to", "Send ETH to")
  .addParam("amount")
  .setAction(async (taskArgs, hre) => {
    let [signer] = await hre.ethers.getSigners();
    if (taskArgs.from) {
      signer = await hre.ethers.getSigner(taskArgs.from);
    }

    const tx = await signer.sendTransaction({
      to: taskArgs.to,
      value: parseEther(taskArgs.amount),
    });
    await tx.wait();
  });

task("balance-eth")
  .addParam("address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.address);
    console.log(formatEther(balance));
  });

task("deployer").setAction(async (_taskArgs, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  console.log(deployer.address);
});
