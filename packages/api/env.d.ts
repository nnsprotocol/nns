import type { Network } from "alchemy-sdk";

interface Env {
  readonly SIGNER_PK: Hex;
  readonly ALCHEMY_API_KEY: string;
  readonly NNS_V1_ERC721_ADDRESS: Address;
  readonly NNS_V1_ERC721_NETWORK: Network;
  readonly NOUNS_ERC721_ADDRESS: Address;
  readonly NOUNS_ERC721_NETWORK: Network;
  readonly NOUNS_ERC20_ADDRESS: Address;
  readonly NOUNS_ERC20_NETWORK: Network;
}