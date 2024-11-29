import { Request } from "lambda-api";
import { Address, isAddress, isHex } from "viem";
import z from "zod";
import RESOLVER_ABI from "../abi/IResolver";
import { createChainClient, Network } from "../shared/chain";
import config from "../shared/config";

const inputSchema = z.object({
  address: z.string().refine(isAddress),
  clds: z.string().refine(isHex).array().optional(),
  fallback: z.boolean().optional(),
  disable_v1: z.boolean().optional(),
});

type Input = z.infer<typeof inputSchema>;

type Output = {
  name: string | null;
};

export default async function resolveHandler(req: Request): Promise<Output> {
  const input = await inputSchema.parseAsync(req.body);
  const disableV1 = input.disable_v1 ?? false;

  let name = await resolveNNS(input);
  if (!name && !disableV1) {
    name = await resolveV1(input.address);
  }

  return {
    name: name || null,
  };
}

async function resolveNNS(input: Input): Promise<string | null> {
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
  return name || null;
}

const nnsV1ResolverABI = [
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "resolve",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
] as const;

async function resolveV1(address: Address): Promise<string | null> {
  const chain = createChainClient(Network.ETH_MAINNET);
  const name = await chain
    .readContract({
      abi: nnsV1ResolverABI,
      address: "0x849F92178950f6254db5D16D1ba265E70521aC1B",
      functionName: "resolve",
      args: [address],
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return name || null;
}
