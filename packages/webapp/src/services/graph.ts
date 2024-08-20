import { useQuery } from "@tanstack/react-query";
import { Address, Hash, Hex } from "viem";
import { normalize } from "viem/ens";

const GRAPH_URL: string = import.meta.env.VITE_GRAPH_URL;

export type Registry = {
  id: Hash;
  name: string;
  address: Address;
  hasExpiringNames: boolean;
  totalSupply: string;
};

export type Subdomain = {
  id: Hash;
  name: string;
  resolvedAddress: Address | null;
  parent: {
    id: Hash;
    name: string;
    registry: Registry;
  };
};

export type Domain = {
  id: Hash;
  name: string;
  resolvedAddress: Address | null;
  registry: Registry;
  owner: {
    id: Address;
  };
  approval?: {
    id: Address;
  };
  subdomains?: Subdomain[];
};

const REGISTRY_SELECT = `
  id
  name
  address
  hasExpiringNames
  totalSupply
`;

const SUBDOMAIN_SELECT = `
id
name
resolvedAddress
parent {
  id
  name
  registry {
    ${REGISTRY_SELECT}
  }
}
`;

const DOMAIN_SELECT = `
id
name
resolvedAddress
registry {
  ${REGISTRY_SELECT}
}
owner {
  id
}
approval {
  id
}
subdomains {
  ${SUBDOMAIN_SELECT}
}
`;

interface FetchDomainInput {
  cldId: Hex;
  name: string;
}

async function fetchSearchDomains(d: FetchDomainInput) {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          domains(
            where: {
              registry: "${d.cldId.toLowerCase()}"
              name_contains: "${normalize(d.name)}"
            }
          ) {
            ${DOMAIN_SELECT}
          }
        }
      `,
    }),
  });
  const { data } = await res.json();
  return (data.domains || []) as Domain[];
}

export function useSearchDomain(q: Partial<FetchDomainInput>) {
  return useQuery({
    queryKey: ["searchDomain", q.cldId, q.name],
    queryFn: async () => {
      return await fetchSearchDomains({
        cldId: q.cldId || "0x",
        name: q.name || "",
      });
    },
    enabled: Boolean(q.cldId) && Boolean(q.name),
  });
}

export async function fetchRegistry(id: Hash) {
  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          registry(id: "${id}") {
            ${REGISTRY_SELECT}
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return data.registry as Registry | null;
}

export function useRegistry(data: { id?: Hash }) {
  return useQuery({
    queryKey: ["registries", data.id],
    queryFn: () => fetchRegistry(data.id || "0x"),
    enabled: Boolean(data.id),
  });
}
