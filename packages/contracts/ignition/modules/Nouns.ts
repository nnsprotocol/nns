import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import NNSModule from "./NNS";
import { namehash, parseEther } from "ethers";

const NounsModule = buildModule("NounsModule", (m) => {
  const deployer = m.getAccount(0);
  const { controller } = m.useModule(NNSModule);

  const aggregator = m.getParameter<string>("aggregator");

  // USD Pricing Oracle
  const prices = [parseEther("100"), parseEther("40"), parseEther("20")];
  const pricer = m.contract("USDPricingOracle", [prices, aggregator], {
    id: "NounsUSDPricingOracle",
  });

  // Deploy CLD
  const register = m.call(controller, "registerCld", [
    "nouns", // string memory name
    80, // uint8 communityReward
    5, // uint8 referralReward
    pricer, // IPricingOracle pricingOracle
    deployer, // address communityPayable
    deployer, // address communityManager
    true, // bool hasExpiringNames
    false, // bool isDefaultCldResolver
  ]);
  const cldId = namehash("nouns");
  m.call(controller, "setCldSignatureRequired", [cldId, true], {
    after: [register],
  });

  return {
    pricer,
  };
});

export default NounsModule;