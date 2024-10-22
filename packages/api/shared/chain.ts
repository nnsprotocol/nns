import { createPublicClient, http } from "viem";
import { base, baseSepolia, mainnet } from "viem/chains";

export enum Network {
  ETH_MAINNET = "eth-mainnet",
  BASE_MAINNET = "base-mainnet",
  BASE_SEPOLIA = "base-sepolia",
}

function getChainFromNetwork(network: Network) {
  switch (network) {
    case Network.BASE_MAINNET:
      return base;

    case Network.BASE_SEPOLIA:
      return baseSepolia;

    case Network.ETH_MAINNET:
      return mainnet;
  }
}

export function createChainClient(network: Network) {
  return createPublicClient({
    chain: getChainFromNetwork(network),
    transport: http(),
  });
}
