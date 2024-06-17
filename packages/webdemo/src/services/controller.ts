import { useReadContract } from "wagmi";
import AGGREGATOR_ABI from "./abi/IAggregator";
import CONTROLLER_ABI from "./abi/IController";
import PRICING_ORACLE_ABI from "./abi/IPricingOracle";
import { useMemo } from "react";
import { Hash } from "viem";

export const CONTROLLER_ADDRESS = "0x3eD890A427a7691e24fc40A772cF3f9e8e1841d7";
const USD_ETH_AGGREGATOR_ADDRESS = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";

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
  });

  return useMemo(() => {
    if (!usdETH.data || !priceETH.data) {
      return null;
    }

    const priceUSD = (priceETH.data * usdETH.data[1]) / 10n ** 8n;
    // const priceUSDFloat =
    //   Number(priceUSD / 10n ** 18n) +
    //   Number((priceUSD % 10n ** 18n) / 10n ** 16n) / 100;
    return {
      eth: priceETH.data,
      usd: priceUSD,
    };
  }, [priceETH.data, usdETH.data]);
}
