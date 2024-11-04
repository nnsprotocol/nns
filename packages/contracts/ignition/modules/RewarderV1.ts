import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import NNSModule from "./NNS";
import { namehash, parseEther } from "ethers";

const RewarderV1Module = buildModule("RewarderV1Module", (m) => {
  const { rewarderProxyAdmin, rewarder } = m.useModule(NNSModule);

  const rewarderV1 = m.contract("NNSRewarderV1");

  m.call(rewarderProxyAdmin, "upgradeAndCall", [rewarder, rewarderV1, "0x"]);

  return {
    rewarderProxyAdmin,
    rewarder,
  };
});

export default RewarderV1Module;
