import { IRequest } from "itty-router";
import { isAddress, isHex } from "viem";
import z from "zod";
import RESOLVER_ABI from "../abi/IResolver";
import { Env } from "../env";
import { createChainClient, Network } from "../shared/chain";

const inputSchema = z.object({
  address: z.string().refine(isAddress),
  clds: z.string().refine(isHex).array().optional(),
  fallback: z.boolean().optional(),
});

type Output = {
  name: string | null;
};

export default async function resolveHandler(
  req: IRequest,
  env: Env
): Promise<Output> {
  const input = await inputSchema.parseAsync(
    await req.json().catch(() => null)
  );
  const fallback = input.fallback ?? true;
  const clds = input.clds?.map(BigInt) || [];

  const chain = createChainClient(Network.BASE_SEPOLIA);
  const name = await chain
    .readContract({
      abi: RESOLVER_ABI,
      functionName: "reverseNameOf",
      args: [input.address, clds, fallback],
      address: env.NNS_RESOLVER,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return {
    name,
  };
}
