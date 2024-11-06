import { Request } from "lambda-api";
import { Address, encodePacked, Hex, isAddress, keccak256, toHex } from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { namehash, normalize } from "viem/ens";
import z from "zod";
import CONTROLLER_ABI from "../abi/IController";
import PRICING_ORACLE_ABI from "../abi/IPricingOracle";
import { createChainClient, Network } from "../shared/chain";
import config from "../shared/config";
import { RegistrationValidator } from "./shared";
import { StatusError } from "../shared/errors";

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

export default async function registerHandler(req: Request): Promise<Output> {
  const signer = privateKeyToAccount(config.SIGNER_PK);
  const validator = RegistrationValidator.fromConfig();

  const input = await inputSchema.parseAsync(req.body);

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
      if (!result.canRegister) {
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
      controller: config.NNS_CONTROLLER,
      name,
      periods: input.periods,
      network: config.NNS_NETWORK,
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
  network: Network;
}): Promise<bigint> {
  const client = createChainClient(input.network);
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
