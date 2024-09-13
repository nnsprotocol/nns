/// <reference types="vite/client" />

import { Address } from "viem";

interface ImportMetaEnv {
  readonly VITE_NNS_API_URL: string;
  readonly VITE_GRAPH_URL: string;
  readonly VITE_CONTROLLER_ADDRESS: Address;
  readonly VITE_USD_ETH_AGGREGATOR_ADDRESS: Address;
  readonly VITE_RESOLVER_ADDRESS: Address;
  readonly VITE_REWARDER_ADDRESS: Address;
  readonly VITE_ACCOUNT_REWARDER_ADDRESS: Address;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
