import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { namehash, parseEther } from "ethers";

const NNSModule = buildModule("NNSModule", (m) => {
  const deployer = m.getAccount(0);

  // Rewarder
  const erc20 = m.getParameter<string>("erc20");
  const swapRouter = m.getParameter<string>("swapRouter");
  const weth = m.getParameter<string>("weth");
  const aggregator = m.getParameter<string>("aggregator");
  const signer = m.getParameter<string>("signer");

  const rewarder = m.contract("NNSRewarder", [
    swapRouter,
    erc20,
    weth,
    deployer, // TODO: change me.
  ]);
  // Rewarder: Ecosystem
  const ecosystemToken = m.contract("NNSResolverToken", []);
  const ecosystemRewarder = m.contract(
    "ERC721BasedRewarder",
    [
      ecosystemToken,
      24 * 3600, // TODO: change me.
    ],
    {
      id: "EcosystemRewarder",
    }
  );
  m.call(ecosystemRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setEcosystemRewarder", [ecosystemRewarder]);
  // Rewarder: Accounts
  const accountRewarder = m.contract("AccountRewarder", []);
  m.call(accountRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setAccountRewarder", [accountRewarder]);

  // Resolver
  const resolver = m.contract("NNSResolver", []);

  // Controller
  const cldF = m.contract("CldFactory", []);
  const controller = m.contract("NNSController", [
    rewarder,
    resolver,
    cldF,
    signer,
  ]);
  const setControllerOnRewarder = m.call(rewarder, "setController", [
    controller,
  ]);
  m.call(resolver, "transferOwnership", [controller]);

  // USD Pricing Oracle for .⌐◨-◨
  const prices = [parseEther("50"), parseEther("20"), parseEther("10")];
  const pricer = m.contract("USDPricingOracle", [prices, aggregator]);

  // Deploy .⌐◨-◨ CLD
  const registerNoggles = m.call(
    controller,
    "registerCld",
    [
      "⌐◨-◨", // string memory name
      35, // uint8 communityReward
      10, // uint8 referralReward
      pricer, // IPricingOracle pricingOracle
      deployer, // address communityPayable
      deployer, // address communityManager
      false, // bool hasExpiringNames
      true, // bool isDefaultCldResolver
    ],
    {
      after: [setControllerOnRewarder],
    }
  );
  const nogglesCldId = namehash("⌐◨-◨");
  m.call(controller, "setCldSignatureRequired", [nogglesCldId, true], {
    after: [registerNoggles],
  });

  const nogglesRegistry = m.staticCall(controller, "registryOf", [
    nogglesCldId,
  ]);

  // Rewarder: Holders
  const holdersRewarder = m.contract(
    "ERC721BasedRewarder",
    [
      nogglesRegistry,
      24 * 3600, // TODO: change me.
    ],
    {
      id: "HoldersRewarder",
    }
  );
  m.call(holdersRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setHolderRewarder", [holdersRewarder]);

  return {
    rewarder,
    resolver,
    controller,
    pricer,
    holdersRewarder,
    accountRewarder,
    ecosystemRewarder,
  };
});

export default NNSModule;
