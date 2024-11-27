import { createPublicClient, http } from "viem";
import { base, baseSepolia, mainnet } from "viem/chains";
import config from "./config";

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

    default:
      throw new Error(`invalid network: ${network}`);
  }
}

export function createChainClient(network: Network) {
  const rpcURL = config.ALCHEMY_API_KEY
    ? `https://${network}.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`
    : undefined;
  return createPublicClient({
    chain: getChainFromNetwork(network),
    transport: http(rpcURL),
  });
}
