import { Address, Hex } from "viem";

const API_URL = import.meta.env.VITE_NNS_API_URL;

interface RegisterRequest {
  to: Address;
  labels: [string, string];
  withReverse: boolean;
  referer: Address;
  periods: number;
}

type RegisterResponse = RegisterRequest & {
  expiry: Hex;
  nonce: Hex;
  signature: Hex;
};

export async function fetchRegisterSignature(
  req: RegisterRequest
): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  const body = await res.json();
  return body as RegisterResponse;
}
