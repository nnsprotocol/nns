import { Address } from "viem";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";

/** NNS_OWNER owns 2707.⌐◨-◨ */
export const NNS_OWNER = "0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036";
/** NOUNS_NFT_OWNER owns Nouns 1012 */
export const NOUNS_NFT_OWNER = "0x73E09de9497f2dfFf90B1e97aC0bE9cccA1677Ec";
/** NOUNS_COIN_OWNER owns some $NOUN and no Nouns */
export const NOUNS_COIN_OWNER = "0x338f3E577312F90A74754dddd0D7568C2c3DC211";

export function randomAddress(): Address {
  return privateKeyToAddress(generatePrivateKey());
}