//api.ensdata.net/0xd55Ab78034FcB6349830d0CfdFEFB6A8051d2685

import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

async function fetchEnsAvatar(address: string) {
  const res = await fetch(`https://api.ensdata.net/${address}`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { avatar_url?: string };
  return data.avatar_url || null;
}

export function useAvatar(d: { address?: Address }) {
  return useQuery({
    queryKey: ["ens-avatar", d.address],
    queryFn: () => {
      if (!d.address) {
        return null;
      }
      return fetchEnsAvatar(d.address);
    },
  });
}
