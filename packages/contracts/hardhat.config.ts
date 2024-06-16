import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-abi-exporter";
import dotenv from "dotenv";
import "./tasks";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
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
