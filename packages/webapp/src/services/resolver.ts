import { Address } from "viem";
import { useReadContract } from "wagmi";
import RESOLVER_ABI from "../abi/IResolver";

export const RESOLVER_ADDRESS = import.meta.env.VITE_RESOLVER_ADDRESS;

export function useDefaultCld(opt: { account?: Address }) {
  return useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "defaultCldOf",
    args: [opt.account || "0x"],
    query: {
      enabled: Boolean(opt.account),
    },
  });
}

export function useResolvedName(opt: { account?: Address; cldId?: bigint }) {
  return useReadContract({
    abi: RESOLVER_ABI,
    address: RESOLVER_ADDRESS,
    functionName: "reverseNameOf",
    args: [opt.account || "0x", opt.cldId ? [opt.cldId] : [], true],
    query: {
      enabled: Boolean(opt.account),
    },
  });
}
