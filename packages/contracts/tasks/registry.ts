import { namehash } from "ethers";
import { task } from "hardhat/config";
import { getRegistry } from "./helpers";

task("set-reverse")
  .addParam("cld", "name of the CLD")
  .addParam("address", "Reverse")
  .addParam("name", "Domain Name")
  .setAction(async (taskArgs, hre) => {
    const registry = await getRegistry(hre, taskArgs.cld);
    const domain = `${taskArgs.name}.${taskArgs.cld}`;
    await registry.setReverse(taskArgs.address, namehash(domain));
  });

task("delete-reverse")
  .addParam("cld", "name of the CLD")
  .addParam("address", "Reverse")
  .setAction(async (taskArgs, hre) => {
    const registry = await getRegistry(hre, taskArgs.cld);
    await registry.deleteReverse(taskArgs.address);
  });

export default {};
