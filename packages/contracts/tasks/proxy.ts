import { task } from "hardhat/config";

task("proxy-verify").setAction(async (_taskArgs, hre) => {
  await hre.run("compile");

  console.log("Validating original implementations...");
  const contracts = ["NNSRewarder", "NNSResolver", "NNSController"];
  for (const name of contracts) {
    const factory = await hre.ethers.getContractFactory(name);
    await hre.upgrades.validateImplementation(factory, {
      kind: "transparent",
    });
    console.log(`✅ ${name}`);
  }

  console.log("Validating upgrades...");
  const upgrades = [
    ["NNSRewarder", "NNSRewarderV1"],
    ["NNSController", "NNSControllerV1"],
  ];
  for (const [oldC, newC] of upgrades) {
    const oldFactory = await hre.ethers.getContractFactory(oldC);
    const newFactory = await hre.ethers.getContractFactory(newC);
    await hre.upgrades.validateUpgrade(oldFactory, newFactory, {
      kind: "transparent",
    });
    console.log(`✅ ${oldC} -> ${newC}`);
  }
  console.log("Done");
});
