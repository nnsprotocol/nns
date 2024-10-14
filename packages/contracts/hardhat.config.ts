import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-tracer";
import "@openzeppelin/hardhat-upgrades";
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
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
    },
  },
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY!],
    },
    virtual_base: {
      url: "https://virtual.base.rpc.tenderly.co/a4ea2f02-476e-4c7f-99d6-e65abf6f1ca7",
      chainId: 8453,
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY!],
    },
  },
};

export default config;
