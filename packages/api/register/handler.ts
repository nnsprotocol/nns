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
import { privateKeyToAccount, PrivateKeyAccount } from "viem/accounts";
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
type Input = z.infer<typeof inputSchema>;

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
  const signer = privateKeyToAccount(env.SIGNER_PK);

  const input = await inputSchema.parseAsync(await req.json());

  const cld = input.labels[1];
  const name = normalize(input.labels[0]);

  switch (cld) {
    case "⌐◨-◨":
      await validateNoggles(input, env);
      break;

    default:
      throw new StatusError(400, "unsupported_cld");
  }

  const { expiry, nonce, signature } = await signRegistration(signer, input);
  return {
    ...input,
    labels: [name, cld],
    expiry: toHex(expiry),
    nonce: toHex(nonce),
    signature,
  };
}

async function validateNoggles(input: Input, env: Env) {
  const client = createPublicClient({
    transport: http(), // TODO: use alchemy
    chain: mainnet,
  });

  const tokenId = BigInt(keccak256(toBytes(normalize(input.labels[0]))));
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
}

async function signRegistration(
  signer: PrivateKeyAccount,
  input: Input
): Promise<{ expiry: bigint; nonce: bigint; signature: Hex }> {
  const cld = input.labels[1];
  const name = normalize(input.labels[0]);

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
        BigInt(namehash(cld)),
        normalize(name),
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
    expiry,
    nonce,
    signature,
  };
}
