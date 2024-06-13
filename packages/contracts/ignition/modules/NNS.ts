import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LockModule = buildModule("NNSModule", (m) => {
  const account1 = m.getAccount(1);

  const erc20 = m.contract("ERC20Mock", []);
  const swapRouter = m.contract("SwapRouterMock", [erc20]);
  const rewarder = m.contract("NNSRewarder", [
    swapRouter,
    erc20,
    erc20,
    account1,
    10,
  ]);
  const resolver = m.contract("NNSResolver", []);
  const cldF = m.contract("CldFactory", []);
  const controller = m.contract("NNSController", [rewarder, resolver, cldF]);

  const pricer = m.contract("ConstantPricingOracle", [10]);

  m.call(rewarder, "transferOwnership", [controller]);
  m.call(resolver, "transferOwnership", [controller]);

  return {
    erc20,
    rewarder,
    resolver,
    controller,
    pricer,
  };
});

export default LockModule;
