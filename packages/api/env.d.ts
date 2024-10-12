import { Address } from "viem";
import { Network } from "./register/shared";

interface Env {
  readonly SIGNER_PK: Hex;
  readonly NNS_V1_ERC721_ADDRESS: Address;
  readonly NNS_V1_ERC721_NETWORK: Network;
  readonly NOUNS_ERC721_ADDRESS: Address;
  readonly NOUNS_ERC721_NETWORK: Network;
  readonly NOUNS_ERC20_ADDRESS: Address;
  readonly NOUNS_ERC20_NETWORK: Network;
  readonly NNS_CONTROLLER: Address;
}
