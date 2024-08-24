import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import NNSModule from "./NNS";
import { parseEther } from "ethers";

const NounsModule = buildModule("NounsModule", (m) => {
  const deployer = m.getAccount(0);
  const { controller } = m.useModule(NNSModule);

  // USD Pricing Oracle
  const prices = [parseEther("100"), parseEther("40"), parseEther("20")];
  const aggregator = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
  const pricer = m.contract("USDPricingOracle", [prices, aggregator], {
    id: "NounsUSDPricingOracle",
  });

  // Deploy CLD
  m.call(controller, "registerCld", [
    "nouns", // string memory name
    80, // uint8 communityReward
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

export default NounsModule;
