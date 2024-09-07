import { StatusError } from "itty-router";
import {
  Address,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  createPublicClient,
  erc721Abi,
  http,
  isAddressEqual,
  keccak256,
  toBytes,
  isAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import z from "zod";

export const zAddress = z.custom<Address>(
  (val) => typeof val === "string" && isAddress(val)
);

type ValidationInput = {
  name: string;
  contract: Address;
  to: Address;
};

export async function validateNoggles(input: ValidationInput) {
  const client = createPublicClient({
    transport: http(), // TODO: use alchemy
    chain: mainnet,
  });

  const tokenId = BigInt(keccak256(toBytes(normalize(input.name))));
  const owner = await client
    .readContract({
      abi: erc721Abi,
      address: input.contract,
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
    return false;
  }
  return true;
}
