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
  expiry?: string;
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
expiry
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
  return sendGraphRequest<Domain[]>(
    `
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
    "domains"
  );
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
  return await sendGraphRequest<Registry>(
    `
      {
        registry(id: "${id}") {
          ${REGISTRY_SELECT}
        }
      }
    `,
    "registry"
  );
}

export function useRegistry(data: { id?: Hash }) {
  return useQuery({
    queryKey: ["registries", data.id],
    queryFn: () => fetchRegistry(data.id || "0x"),
    enabled: Boolean(data.id),
  });
}

export async function fetchRegistries() {
  return await sendGraphRequest<Registry[]>(
    `
      {
        registries {
          ${REGISTRY_SELECT}
        }
      }
    `,
    "registries"
  );
}

export function useRegistries() {
  return useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });
}

type CollectionPreview = {
  numberOfTokens: number;
  defaultResolverRegistry: null | Pick<Registry, "id">;
  registry: {
    id: Hash;
    name: string;
    previewDomains: Domain[] | null;
    primaryDomain: [Domain] | null;
  };
};

async function fetchCollectionPreview(data: {
  owner: Address;
  previewCount?: number;
}) {
  const accountId = data.owner.toLowerCase();
  const previewCount = data.previewCount || 3;
  const res = await sendGraphRequest<{ stats: CollectionPreview[] }>(
    `
      {
        account(id:"${accountId}") {
          id
          defaultResolverRegistry {
            id
          }
          stats {
            numberOfTokens
            registry {
              id
              name
              previewDomains: domains(first: ${previewCount}, where: { owner: "${accountId}" }) {
                ${DOMAIN_SELECT}
              }
              primaryDomain: domains(where: { resolvedAddress: "${accountId}" }) {
                name
              }
            }
          }
        }
      }
    `,
    "account"
  );
  return res?.stats || [];
}

export function useCollectionPreview(
  data: Partial<Parameters<typeof fetchCollectionPreview>[0]>
) {
  return useQuery({
    queryKey: [data.owner, "collectionPreview", data.previewCount],
    queryFn: () =>
      fetchCollectionPreview({
        ...data,
        owner: data.owner || "0x",
      }),
    enabled: Boolean(data.owner),
  });
}

async function fetchDomains(data: { owner: Address; cldId: Hex }) {
  const accountId = data.owner.toLowerCase();
  const cldId = data.cldId.toLowerCase();
  return await sendGraphRequest<Domain[]>(
    `
      {
        domains(where: { 
          owner: "${accountId}" 
          registry: "${cldId}"
        }) {
          ${DOMAIN_SELECT}
        }
      }
    `,
    "domains"
  );
}

export function useDomains(data: Partial<Parameters<typeof fetchDomains>[0]>) {
  return useQuery({
    queryKey: [data.owner, "domains", data.cldId],
    queryFn: () =>
      fetchDomains({
        cldId: data.cldId || "0x",
        owner: data.owner || "0x",
      }),
    enabled: Boolean(data.owner) && Boolean(data.cldId),
  });
}

async function sendGraphRequest<T>(query: string, key: string) {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  return body.data[key] as T | null;
}
