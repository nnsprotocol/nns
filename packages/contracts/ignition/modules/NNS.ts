import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  ArgumentType,
  ContractOptions,
  IgnitionModuleBuilder,
  NamedArtifactContractAtFuture,
} from "@nomicfoundation/ignition-core";
import { namehash, parseEther } from "ethers";

function deployWithProxy<ContractNameT extends string>(
  m: IgnitionModuleBuilder,
  contractName: ContractNameT,
  initArgs?: ArgumentType[],
  options?: ContractOptions
): {
  contract: NamedArtifactContractAtFuture<ContractNameT>;
  proxyAdmin: NamedArtifactContractAtFuture<"ProxyAdmin">;
} {
  const deployer = m.getAccount(0);

  const idPrefix = options?.id || contractName;

  const impl = m.contract(contractName, [], options);

  const initData = m.encodeFunctionCall(impl, "initialize", initArgs);
  const proxy = m.contract(
    "TransparentUpgradeableProxy",
    [impl, deployer, initData],
    {
      id: `${idPrefix}Proxy`,
    }
  );

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin",
    {
      id: `${idPrefix}ProxyAdminAddress`,
    }
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, {
    id: `${idPrefix}ProxyAdmin`,
  });
  const proxiedContract = m.contractAt(contractName, proxy, {
    id: `${idPrefix}ViaProxy`,
  });
  return {
    contract: proxiedContract,
    proxyAdmin,
  };
}

const NNSModule = buildModule("NNSModule", (m) => {
  // Rewarder
  const erc20 = m.getParameter<string>("erc20");
  const swapRouter = m.getParameter<string>("swapRouter");
  const weth = m.getParameter<string>("weth");
  const aggregator = m.getParameter<string>("aggregator");
  const signer = m.getParameter<string>("signer");
  const holderSnapshotIntervalSeconds = m.getParameter<number>(
    "holderSnapshotIntervalSeconds"
  );
  const ecosystemSnapshotIntervalSeconds = m.getParameter<number>(
    "ecosystemSnapshotIntervalSeconds"
  );
  const nnsWallet = m.getParameter<string>("nnsWallet");

  const { contract: rewarder, proxyAdmin: rewarderProxyAdmin } =
    deployWithProxy(m, "NNSRewarder", [swapRouter, erc20, weth, nnsWallet]);

  // Rewarder: Ecosystem
  const ecosystemToken = m.contract("NNSResolverToken", []);
  const ecosystemRewarder = m.contract(
    "ERC721BasedRewarder",
    [ecosystemToken, ecosystemSnapshotIntervalSeconds],
    {
      id: "EcosystemRewarder",
      after: [ecosystemToken],
    }
  );
  m.call(ecosystemRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setEcosystemRewarder", [ecosystemRewarder]);
  m.call(ecosystemToken, "transferOwnership", [nnsWallet]);
  // Rewarder: Accounts
  const accountRewarder = m.contract("AccountRewarder", []);
  m.call(accountRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setAccountRewarder", [accountRewarder]);

  // Resolver
  const { contract: resolver, proxyAdmin: resolverProxyAdmin } =
    deployWithProxy(m, "NNSResolver");

  // Controller
  const cldF = m.contract("CldFactory", []);
  const { contract: controller, proxyAdmin: controllerProxyAdmin } =
    deployWithProxy(m, "NNSController", [rewarder, resolver, cldF, signer]);
  const setControllerOnRewarder = m.call(rewarder, "setController", [
    controller,
  ]);
  m.call(resolver, "transferOwnership", [controller]);
  m.call(cldF, "transferOwnership", [controller]);

  // USD Pricing Oracle for .⌐◨-◨
  const prices = [
    parseEther("10000"),
    parseEther("1000"),
    parseEther("250"),
    parseEther("100"),
  ];
  const pricer = m.contract("USDPricingOracle", [prices, aggregator]);

  // Deploy .⌐◨-◨ CLD
  const nogglesCldName = "⌐◨-◨";
  const registerNoggles = m.call(
    controller,
    "registerCld",
    [
      nogglesCldName, // string memory name
      0, // uint8 communityReward
      35, // uint8 referralReward
      60, // uint8 ecosystemReward
      pricer, // IPricingOracle pricingOracle
      nnsWallet, // address communityPayable
      nnsWallet, // address communityManager
      false, // bool hasExpiringNames
      true, // bool isDefaultCldResolver
    ],
    {
      after: [setControllerOnRewarder],
    }
  );
  const nogglesCldId = namehash(nogglesCldName);
  m.call(controller, "setCldSignatureRequired", [nogglesCldId, true], {
    after: [registerNoggles],
  });

  const nogglesRegistry = m.readEventArgument(
    registerNoggles,
    "CldRegistered",
    "registry"
  );

  // Rewarder: Holders
  const holdersRewarder = m.contract(
    "ERC721BasedRewarder",
    [nogglesRegistry, holderSnapshotIntervalSeconds],
    {
      id: "HoldersRewarder",
      after: [nogglesRegistry],
    }
  );
  m.call(holdersRewarder, "transferOwnership", [rewarder]);
  m.call(rewarder, "setHolderRewarder", [holdersRewarder]);

  return {
    rewarder,
    rewarderProxyAdmin,
    resolver,
    resolverProxyAdmin,
    controller,
    controllerProxyAdmin,
    pricer,
    holdersRewarder,
    accountRewarder,
    ecosystemRewarder,
    cldFactory: cldF,
  };
});

export default NNSModule;
