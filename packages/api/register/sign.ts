import { IRequest, StatusError } from "itty-router";
import { Address, encodePacked, Hex, keccak256, toHex } from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { namehash, normalize } from "viem/ens";
import z from "zod";
import { validateNoggles, zAddress } from "./shared";

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
    case "⌐◨-◨": {
      const canRegister = await validateNoggles({
        contract: env.NNS_V1_ERC721_ADDRESS,
        name,
        to: input.to,
      });
      if (!canRegister) {
        throw new StatusError(409, "name_already_owned");
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
