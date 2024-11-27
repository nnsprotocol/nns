import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import NNSModule from "./NNS";
import { namehash, parseEther } from "ethers";

const NounsModule = buildModule("NounsModule", (m) => {
  const deployer = m.getAccount(0);
  const { controller } = m.useModule(NNSModule);

  const aggregator = m.getParameter<string>("aggregator");
  const nounsManager = m.getParameter<string>("nounsManager");

  // USD Pricing Oracle
  const prices = [
    parseEther("2500"),
    parseEther("500"),
    parseEther("125"),
    parseEther("50"),
  ];
  const pricer = m.contract("USDPricingOracle", [prices, aggregator], {
    id: "NounsUSDPricingOracle",
  });

  // Deploy CLD
  const register = m.call(controller, "registerCld", [
    "nouns", // string memory name
    70, // uint8 communityReward
    15, // uint8 referralReward
    10, // uint8 ecosystemReward
    pricer, // IPricingOracle pricingOracle
    nounsManager, // address communityPayable
    nounsManager, // address communityManager
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
