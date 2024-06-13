import { task } from "hardhat/config";
import { getNNSController } from "./helpers";

task("register-cld", "Registers a new CLD")
  .addParam("name")
  .addParam("communityreward")
  .addParam("referralreward")
  .addParam("pricingoracle")
  .addParam("communitypayable")
  .addParam("communitymanager")
  .addParam("expiringnames")
  .addParam("defaultcldresolver")
  .addParam("splitsharecld")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const controller = await getNNSController(hre);

    const tx = await controller
      .connect(signer)
      .registerCld(
        taskArgs.name,
        taskArgs.communityreward,
        taskArgs.referralreward,
        taskArgs.pricingoracle,
        taskArgs.communitypayable,
        taskArgs.communitymanager,
        taskArgs.expiringnames === "true",
        taskArgs.defaultcldresolver === "true",
        taskArgs.splitsharecld === "true"
      );
    await tx.wait();
  });

task("register-name", "Registers a new name")
  .addParam("name")
  .addParam("cld")
  .addParam("to", "Address to register the name to", undefined, undefined, true)
  .addParam("withreverse")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const controller = await getNNSController(hre);

    const tx = await controller
      .connect(signer)
      .register(
        taskArgs.to || signer.address,
        [taskArgs.name, taskArgs.cld],
        taskArgs.withreverse === "true",
        hre.ethers.ZeroAddress,
        0,
        { value: hre.ethers.parseEther("0.01") }
      );
    await tx.wait();
  });

export default {};
