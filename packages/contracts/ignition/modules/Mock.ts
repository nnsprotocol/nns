import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const MockModule = buildModule("MockModule", (m) => {
  const erc20 = m.contract("ERC20Mock", []);
  const swapRouter = m.contract("SwapRouterMock", [erc20]);

  m.call(erc20, "mint", [swapRouter, parseEther("10000000000")]);

  return {
    erc20,
    swapRouter,
  };
});

export default MockModule;