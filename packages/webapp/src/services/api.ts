import { useQuery } from "@tanstack/react-query";
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

type AvailabilityRequest = {
  to: Address;
  cld: string;
  name: string;
};

type AvailabilityResponse = {
  canRegister: boolean;
};

async function fetchAvilability(
  req: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const url = new URL(`${API_URL}/availability`);
  url.searchParams.set("cld", req.cld);
  url.searchParams.set("name", req.name);
  url.searchParams.set("to", req.to.toLowerCase());
  const res = await fetch(url.toString(), {
    method: "GET",
  });
  const body = await res.json();
  return body as AvailabilityResponse;
}

export function useRegistrationAvailability(req: Partial<AvailabilityRequest>) {
  return useQuery({
    queryKey: ["availability", ...Object.values(req)],
    queryFn: () =>
      fetchAvilability({
        cld: req.cld || "",
        name: req.name || "",
        to: req.to || "0x",
      }),
    enabled: Boolean(req.cld) && Boolean(req.name) && Boolean(req.to),
  });
}
