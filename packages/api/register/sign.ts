import { IRequest, StatusError } from "itty-router";
import {
  Address,
  createPublicClient,
  encodePacked,
  Hex,
  http,
  isAddress,
  keccak256,
  toHex,
} from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { namehash, normalize } from "viem/ens";
import z from "zod";
import { Env } from "../env";
import { RegistrationValidator } from "./shared";
import { baseSepolia } from "viem/chains";
import CONTROLLER_ABI from "../abi/IController";
import PRICING_ORACLE_ABI from "../abi/IPricingOracle";

const inputSchema = z.object({
  to: z.string().refine(isAddress),
  labels: z.tuple([z.string(), z.string()]),
  withReverse: z.boolean(),
  referer: z.string().refine(isAddress),
  periods: z.number(),
});
type Input = z.infer<typeof inputSchema>;

type Output = {
  to: Address;
  labels: [string, string];
  withReverse: boolean;
  referer: Address;
  periods: number;
  price: Hex;
  nonce: Hex;
  expiry: Hex;
  signature: Hex;
};

export default async function registerHandler(
  req: IRequest,
  env: Env
): Promise<Output> {
  const signer = privateKeyToAccount(env.SIGNER_PK);
  const validator = RegistrationValidator.fromEnv(env);

  const input = await inputSchema.parseAsync(await req.json());

  const cld = input.labels[1];
  const name = normalize(input.labels[0]);

  let isFree = false;
  switch (cld) {
    case "⌐◨-◨": {
      const result = await validator.validateNoggles(input.to, name);
      if (!result.canRegister) {
        throw new StatusError(409, "cannot_register");
      }
      isFree = result.isFree;
      break;
    }

    case "nouns": {
      const result = await validator.validateNouns(input.to, name);
      if (!result) {
        throw new StatusError(409, "cannot_register");
      }
      isFree = result.isFree;
      break;
    }

    default:
      throw new StatusError(400, "unsupported_cld");
  }

  let price = 0n;
  if (!isFree) {
    price = await fetchRegistrationPrice({
      cld,
      controller: env.NNS_CONTROLLER,
      name,
      periods: input.periods,
    });
  }

  const { expiry, nonce, signature } = await signRegistration(
    signer,
    input,
    price
  );
  return {
    ...input,
    labels: [name, cld],
    expiry: toHex(expiry),
    nonce: toHex(nonce),
    price: toHex(price),
    signature,
  };
}

async function signRegistration(
  signer: PrivateKeyAccount,
  input: Input,
  price: bigint
): Promise<{ expiry: bigint; nonce: bigint; signature: Hex }> {
  const cld = input.labels[1];
  const name = normalize(input.labels[0]);

  const expiry = BigInt(Math.floor(Date.now() / 1000 + 5 * 60));
  const nonce = BigInt(
    keccak256(
      encodePacked(["address", "string", "string"], [input.to, name, cld])
    )
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
        "uint256",
      ],
      [
        input.to,
        BigInt(namehash(cld)),
        normalize(name),
        input.withReverse,
        input.referer,
        input.periods,
        price,
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

async function fetchRegistrationPrice(input: {
  name: string;
  cld: string;
  controller: Address;
  periods: number;
}): Promise<bigint> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const oracle = await client.readContract({
    address: input.controller,
    abi: CONTROLLER_ABI,
    functionName: "pricingOracleOf",
    args: [BigInt(namehash(input.cld))],
  });
  const unitPrice = await client.readContract({
    address: oracle,
    abi: PRICING_ORACLE_ABI,
    functionName: "price",
    args: [input.name],
  });
  if (input.periods === 0) {
    return unitPrice;
  }
  return unitPrice * BigInt(input.periods);
}
