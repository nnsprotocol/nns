import { Address, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import ACCOUNT_REWARDER_ABI from "../abi/IAccountRewarder";

export const ACCOUNT_REWARDER_ADDRESS = import.meta.env
  .VITE_ACCOUNT_REWARDER_ADDRESS;

export const REWARDER_ADDRESS = import.meta.env.VITE_REWARDER_ADDRESS;

export function useRewardBalance(opt: { address?: Address }) {
  return useReadContract({
    abi: ACCOUNT_REWARDER_ABI,
    address: ACCOUNT_REWARDER_ADDRESS,
    functionName: "balanceOf",
    args: [opt.address || zeroAddress],
    query: {
      enabled: Boolean(opt.address),
    },
  });
}
