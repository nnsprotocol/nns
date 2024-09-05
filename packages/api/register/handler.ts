import { IRequest, StatusError } from "itty-router";
import {
  Address,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  createPublicClient,
  encodePacked,
  erc721Abi,
  Hex,
  http,
  isAddress,
  isAddressEqual,
  keccak256,
  toBytes,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { namehash, normalize } from "viem/ens";
import z from "zod";

const zAddress = z.custom<Address>(
  (val) => typeof val === "string" && isAddress(val)
);

const inputSchema = z.object({
  to: zAddress,
  labels: z.tuple([z.string(), z.string()]),
  withReverse: z.boolean(),
  referer: zAddress,
  periods: z.number(),
});

type Output = {
  to: Address;
  labels: [string, string];
  withReverse: boolean;
  referer: Address;
  periods: number;
  nonce: Hex;
  expiry: Hex;
  signature: Hex;
};

export default async function registerHandler(
  req: IRequest,
  env: Env
): Promise<Output> {
  const client = createPublicClient({
    transport: http(), // TODO: use alchemy
    chain: mainnet,
  });
  const signer = privateKeyToAccount(env.SIGNER_PK);

  const input = await inputSchema.parseAsync(await req.json());

  const [name, cld] = input.labels; // switch over the cld
  const normalizedName = normalize(name);
  const tokenId = BigInt(keccak256(toBytes(normalizedName)));

  const owner = await client
    .readContract({
      abi: erc721Abi,
      address: env.NNS_V1_ERC721_ADDRESS,
      functionName: "ownerOf",
      args: [tokenId],
    })
    .catch((e) => {
      if (
        e instanceof ContractFunctionExecutionError &&
        e.cause instanceof ContractFunctionRevertedError &&
        e.cause.reason === "ERC721: invalid token ID"
      ) {
        return null;
      }
      console.error("error calling contract", e);
      throw new StatusError(500);
    });

  if (owner && !isAddressEqual(owner, input.to)) {
    throw new StatusError(409, "name_already_owned");
  }

  const expiry = BigInt(Math.floor(Date.now() / 1000 + 5 * 60));
  const nonce = BigInt(
    keccak256(encodePacked(["address", "string"], [input.to, name]))
  );

  const messageHash = keccak256(
    encodePacked(
      [
        "address",
        "uint256",
        "string",
        "bool",
        "address",
        "uint8",
        "uint256",
        "uint256",
      ],
      [
        input.to,
        BigInt(namehash(normalizedName)),
        name,
        input.withReverse,
        input.referer,
        input.periods,
        expiry,
        nonce,
      ]
    )
  );
  const signature = await signer.signMessage({
    message: {
      raw: messageHash,
    },
  });
  return {
    ...input,
    labels: [normalizedName, cld],
    expiry: toHex(expiry),
    nonce: toHex(nonce),
    signature,
  };
}
