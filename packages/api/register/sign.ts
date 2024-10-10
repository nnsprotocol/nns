import { IRequest, StatusError } from "itty-router";
import { Address, encodePacked, Hex, isAddress, keccak256, toHex } from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { namehash, normalize } from "viem/ens";
import z from "zod";
import { Env } from "../env";
import { RegistrationValidator } from "./shared";

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

  switch (cld) {
    case "⌐◨-◨": {
      const canRegister = await validator.validateNoggles(input.to, name);
      if (!canRegister) {
        throw new StatusError(409, "cannot_register");
      }
      break;
    }

    case "nouns": {
      const canRegister = await validator.validateNouns(input.to, name);
      if (!canRegister) {
        throw new StatusError(409, "cannot_register");
      }
      break;
    }

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

async function signRegistration(
  signer: PrivateKeyAccount,
  input: Input
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
