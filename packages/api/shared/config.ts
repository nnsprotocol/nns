import { Address, Hex } from "viem";
import { Network } from "./chain";

export default {
  SIGNER_PK: process.env.SIGNER_PK as Hex,
  NNS_V1_ERC721_ADDRESS: process.env.NNS_V1_ERC721_ADDRESS as Address,
  NNS_V1_ERC721_NETWORK: process.env.NNS_V1_ERC721_NETWORK as Network,
  NOUNS_ERC721_ADDRESS: process.env.NOUNS_ERC721_ADDRESS as Address,
  NOUNS_ERC721_NETWORK: process.env.NOUNS_ERC721_NETWORK as Network,
  NOUNS_ERC20_ADDRESS: process.env.NOUNS_ERC20_ADDRESS as Address,
  NOUNS_ERC20_NETWORK: process.env.NOUNS_ERC20_NETWORK as Network,
  NNS_CONTROLLER: process.env.NNS_CONTROLLER as Address,
  NNS_RESOLVER: process.env.NNS_RESOLVER as Address,
  NNS_NETWORK: process.env.NNS_NETWORK as Network,
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
};
