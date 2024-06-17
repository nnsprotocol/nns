import { useQuery } from "@tanstack/react-query";
import { Address, Hash } from "viem";

const GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/0.0.2/gn";

export type Registry = {
  id: Hash;
  name: string;
  address: Address;
};

export async function fetchRegistries() {
  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          registries {
            id
            name
            address
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return (data.registries || []) as Registry[];
}

export function useRegistries() {
  return useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });
}

export type Domain = {
  id: Hash;
  name: string;
  resolvedAddress: Address | null;
};

export async function fetchDomains(opt: { owner: Address }) {
  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          domains(where: { owner_: { id: "${opt.owner.toLowerCase()}" } }) {
            id
            name
            resolvedAddress
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return (data.domains || []) as Domain[];
}

export function useDomains(opt: { owner?: Address }) {
  return useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains({ owner: opt.owner! }),
    enabled: Boolean(opt.owner),
  });
}
