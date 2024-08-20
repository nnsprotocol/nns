import { useQuery } from "@tanstack/react-query";
import { Address, Hash, Hex } from "viem";
import { normalize } from "viem/ens";

const GRAPH_URL: string = import.meta.env.VITE_GRAPH_URL;

export type Subdomain = {
  id: Hash;
  name: string;
  resolvedAddress: Address | null;
  parent: {
    id: Hash;
    name: string;
    registry: {
      name: string;
      address: Address;
    };
  };
};

export type Domain = {
  id: Hash;
  name: string;
  resolvedAddress: Address | null;
  registry: {
    id: Hash;
    name: string;
    address: Address;
  };
  owner: {
    id: Address;
  };
  approval?: {
    id: Address;
  };
  subdomains?: Subdomain[];
};

const SUBDOMAIN_SELECT = `
id
name
resolvedAddress
parent {
  id
  name
  registry {
    name
    address
  }
}
`;

const DOMAIN_SELECT = `
id
name
resolvedAddress
registry {
  id
  address
  name
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
