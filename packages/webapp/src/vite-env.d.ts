/// <reference types="vite/client" />

import { Address } from "viem";

interface ImportMetaEnv {
  readonly VITE_GRAPH_URL: string;
  readonly VITE_CONTROLLER_ADDRESS: Address;
  readonly VITE_USD_ETH_AGGREGATOR_ADDRESS: Address;
  readonly VITE_RESOLVER_ADDRESS: Address;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
