import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";
import NNSModule from "./NNS";

const TestModule = buildModule("TestModule", (m) => {
  const deployer = m.getAccount(0);
  const { controller } = m.useModule(NNSModule);

  // USD Pricing Oracle
  const prices = [parseEther("10"), parseEther("5"), parseEther("2")];
  const aggregator = m.getParameter("aggregator");
  const pricer = m.contract("USDPricingOracle", [prices, aggregator], {
    id: "LizardUSDPricingOracle",
  });

  // Deploy CLD
  m.call(controller, "registerCld", [
    "lizard", // string memory name
    90, // uint8 communityReward
    5, // uint8 referralReward
    pricer, // IPricingOracle pricingOracle
    deployer, // address communityPayable
    deployer, // address communityManager
    true, // bool hasExpiringNames
    false, // bool isDefaultCldResolver
  ]);

  return {
    pricer,
  };
});

export default TestModule;
