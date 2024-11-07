const { generatePrivateKey } = require("viem/accounts");

process.env.SIGNER_PK = generatePrivateKey();
process.env.NNS_V1_ERC721_ADDRESS =
  "0x4af84535625fe40990bfb35019b944a9933f7593";
process.env.NNS_V1_ERC721_NETWORK = "eth-mainnet";
process.env.NOUNS_ERC721_ADDRESS = "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03";
process.env.NOUNS_ERC721_NETWORK = "eth-mainnet";
process.env.NOUNS_ERC20_ADDRESS = "0x0a93a7BE7e7e426fC046e204C44d6b03A302b631";
process.env.NOUNS_ERC20_NETWORK = "base-mainnet";
process.env.NNS_CONTROLLER = "0x389c9Ca2025c2694bFB0C2fd3d5766c749042926";
process.env.NNS_RESOLVER = "0x764a29FAc0521A7B32a9bB74972e09E7FC476dfe";
process.env.NNS_NETWORK = "base-sepolia";
