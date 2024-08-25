import { useMemo } from "react";
import { Hash } from "viem";
import { useReadContract } from "wagmi";
import AGGREGATOR_ABI from "../abi/IAggregator";
import CONTROLLER_ABI from "../abi/IController";
import PRICING_ORACLE_ABI from "../abi/IPricingOracle";

export const CONTROLLER_ADDRESS = import.meta.env.VITE_CONTROLLER_ADDRESS;
const USD_ETH_AGGREGATOR_ADDRESS = import.meta.env
  .VITE_USD_ETH_AGGREGATOR_ADDRESS;

export function useDomainPrice(opt: { name?: string; cldId?: bigint | Hash }) {
  const pricerAddr = useReadContract({
    abi: CONTROLLER_ABI,
    address: CONTROLLER_ADDRESS,
    functionName: "pricingOracleOf",
    args: [BigInt(opt.cldId || 0)],
    query: {
      enabled: Boolean(opt.cldId),
    },
  });
  const priceETH = useReadContract({
    abi: PRICING_ORACLE_ABI,
    address: pricerAddr.data,
    functionName: "price",
    args: [opt.name!],
    query: {
      enabled: Boolean(opt.name),
    },
  });
  const usdETH = useReadContract({
    abi: AGGREGATOR_ABI,
    address: USD_ETH_AGGREGATOR_ADDRESS,
    functionName: "latestRoundData",
    query: {
      refetchInterval: 1000,
    },
  });

  return useMemo(() => {
    if (!usdETH.data || !priceETH.data) {
      return null;
    }

    const priceUSD = (priceETH.data * usdETH.data[1]) / 10n ** 8n;
    return {
      eth: priceETH.data,
      usd: priceUSD,
    };
  }, [priceETH.data, usdETH.data]);
}
