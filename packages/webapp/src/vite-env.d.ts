/// <reference types="vite/client" />

import { Address } from "viem";

interface ImportMetaEnv {
  readonly VITE_GRAPH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
