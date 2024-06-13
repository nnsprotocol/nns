import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "./tasks";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  abiExporter: {
    except: ["test", "@uniswap", "@openzeppelin"],
    flat: true,
  },
};

export default config;
