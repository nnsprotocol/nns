import { Request } from "lambda-api";
import { isAddress, isHex } from "viem";
import z from "zod";
import RESOLVER_ABI from "../abi/IResolver";
import { createChainClient } from "../shared/chain";
import config from "../shared/config";

const inputSchema = z.object({
  address: z.string().refine(isAddress),
  clds: z.string().refine(isHex).array().optional(),
  fallback: z.boolean().optional(),
});

type Output = {
  name: string | null;
};

export default async function resolveHandler(req: Request): Promise<Output> {
  const input = await inputSchema.parseAsync(req.body);
  const fallback = input.fallback ?? true;
  const clds = input.clds?.map(BigInt) || [];

  const chain = createChainClient(config.NNS_NETWORK);
  const name = await chain
    .readContract({
      abi: RESOLVER_ABI,
      functionName: "reverseNameOf",
      args: [input.address, clds, fallback],
      address: config.NNS_RESOLVER,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return {
    name,
  };
}
