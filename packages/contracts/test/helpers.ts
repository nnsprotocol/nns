import { BigNumberish, ethers, Signer } from "ethers";

export async function signRegistrationRequest(
  signer: Signer,
  req: {
    to: string;
    cldId: BigNumberish;
    name: string;
    withReverse: boolean;
    referer: string;
    periods: number;
    price: BigNumberish;
    expiry: number;
    nonce: BigNumberish;
  }
) {
  const hash = ethers.solidityPackedKeccak256(
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
      req.to,
      req.cldId,
      req.name,
      req.withReverse,
      req.referer,
      req.periods,
      req.price,
      req.expiry,
      req.nonce,
    ]
  );
  return await signer.signMessage(ethers.getBytes(hash));
}
