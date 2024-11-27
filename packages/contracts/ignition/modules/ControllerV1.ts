import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import NNSModule from "./NNS";

const ControllerV1Module = buildModule("ControllerV1Module", (m) => {
  const { controllerProxyAdmin, controller } = m.useModule(NNSModule);

  const controllerV1 = m.contract("NNSControllerV1");

  m.call(controllerProxyAdmin, "upgradeAndCall", [
    controller,
    controllerV1,
    "0x",
  ]);

  return {
    controllerProxyAdmin,
    controller,
  };
});

export default ControllerV1Module;
