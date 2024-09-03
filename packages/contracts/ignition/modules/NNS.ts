import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { namehash, parseEther } from "ethers";

const NNSModule = buildModule("NNSModule", (m) => {
  const deployer = m.getAccount(0);

  const aggregator = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
  const signer = "0xD83720C12B7AFe4Cb8328a88F1FFC1Ebac90424a";

  // Rewarder
  const erc20 = m.contract("ERC20Mock", []);
  const swapRouter = m.contract("SwapRouterMock", [erc20]);
  const rewarder = m.contract("NNSRewarder", [
    swapRouter,
    erc20,
    erc20,
    deployer,
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
    erc20,
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
