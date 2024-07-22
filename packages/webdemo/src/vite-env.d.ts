/// <reference types="vite/client" />

import { Address } from "viem";

interface ImportMetaEnv {
  readonly CONTROLLER_ADDRESS: Address;
  readonly USD_ETH_AGGREGATOR_ADDRESS: Address;
  readonly GRAPH_URL: string;
  readonly REWARDER_ADDRESS: Address;
  readonly RESOLVER_ADDRESS: Address;
  readonly CHAIN_NAME: "base-sepolia" | "hardhat";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
