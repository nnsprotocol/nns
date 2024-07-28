import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import dotenv from "dotenv";
import "./tasks";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  abiExporter: {
    except: ["test", "@uniswap", "@openzeppelin"],
    flat: true,
  },
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY!],
    },
  },
};

export default config;
