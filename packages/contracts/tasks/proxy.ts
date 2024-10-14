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
  console.log("Done");
});
