import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const LockModule = buildModule("NNSModule", (m) => {
  const deployer = m.getAccount(0);

  const erc20 = m.contract("ERC20Mock", []);
  const swapRouter = m.contract("SwapRouterMock", [erc20]);
  const rewarder = m.contract("NNSRewarder", [
    swapRouter,
    erc20,
    erc20,
    deployer,
    10,
  ]);

  const resolver = m.contract("NNSResolver", []);
  const cldF = m.contract("CldFactory", []);
  const controller = m.contract("NNSController", [rewarder, resolver, cldF]);

  const prices = [parseEther("50"), parseEther("20"), parseEther("10")];
  const aggregator = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";

  const pricer = m.contract("USDPricingOracle", [prices, aggregator]);

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
