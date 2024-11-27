import { task } from "hardhat/config";
import { getNNSRewarder, getRegistry } from "./helpers";
import { formatEther } from "ethers";

task("wallet-balance", "Prints the rewards of a wallet")
  .addParam("address", "Wallet")
  .setAction(async (taskArgs, hre) => {
    const rewarder = await getNNSRewarder(hre);
    const acctRewarderAddr = await rewarder.accountRewarder();
    const acctRewarder = await hre.ethers.getContractAt(
      "AccountRewarder",
      acctRewarderAddr
    );
    const balance = await acctRewarder.balanceOf(taskArgs.address);
    console.log(formatEther(balance));
  });
