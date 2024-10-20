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
      baseMainnet: process.env.BASESCAN_API_KEY!,
    },
  },
  networks: {
    "base-mainnet": {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.MAINNET_DEPLOYER_PRIVATE_KEY!],
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY!],
    },
    hardhat: {
      forking: {
        url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 21282821,
      },
      chainId: 8453,
      chains: {
        8453: {
          hardforkHistory: {
            berlin: 10000000,
            london: 20000000,
          },
        },
      },
    },
  },
};

export default config;
