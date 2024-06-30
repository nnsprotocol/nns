import { useQuery } from "@tanstack/react-query";
import { Address, Hash, Hex, namehash } from "viem";

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
};

type DomainsFilter =
  | { owner: Address }
  | { delegatee: Address; operators: { registry: Hex; owner: Address }[] };

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
`;

function mapOperatorQuery(opt: { registry: Hex; owner: Address }) {
  return `{ registry: "${opt.registry.toLowerCase()}", owner: "${opt.owner.toLowerCase()}" }`;
}

export async function fetchDomains(opt: DomainsFilter) {
  let where = "";
  if ("owner" in opt && opt.owner) {
    where = `{ owner_: { id: "${opt.owner.toLowerCase()}" } }`;
  } else if ("delegatee" in opt && opt.delegatee) {
    where = `{ approval_: { id: "${opt.delegatee.toLowerCase()}" } }`;
    where = `{
      or: [
        { approval_: { id: "${opt.delegatee.toLowerCase()}"  } },
        ${opt.operators.map(mapOperatorQuery).join(",\n")}
      ]
    }`;
  }

  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          domains(where: ${where}) {
            ${DOMAIN_SELECT}
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return (data.domains || []) as Domain[];
}

export function useDomains(opt: Partial<DomainsFilter>) {
  let queryKey = ["domains"];
  let queryOpt: DomainsFilter;
  if ("owner" in opt && opt.owner) {
    queryKey.push("owner", opt.owner);
    queryOpt = { owner: opt.owner };
  } else if ("delegatee" in opt && opt.delegatee) {
    queryKey.push("delegatee", opt.delegatee);
    queryKey.push("operators", opt.operators?.toString() || "");
    queryOpt = { delegatee: opt.delegatee, operators: opt.operators || [] };
  }

  return useQuery({
    queryKey,
    queryFn: () => fetchDomains(queryOpt),
    enabled: queryKey.length > 1,
  });
}

export async function fetchDomain(opt: { id: Hash }) {
  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `
        {
          domains(where: { id: "${opt.id.toLowerCase()}" }) {
            ${DOMAIN_SELECT}
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return (data.domains?.[0] as Domain) || null;
}

export function useDomain(
  opt: { id?: Hash } | { name?: string; cldName?: string }
) {
  let id: Hash | undefined;
  if ("id" in opt) {
    id = opt.id;
  } else if ("name" in opt && "cldName" in opt) {
    id = namehash(`${opt.name}.${opt.cldName}`);
  }
  return useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchDomain({ id: id || "0x" }),
    enabled: Boolean(id),
  });
}

async function fetchDomainOperators(opt: { operator: Address }) {
  const response = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: `{
        domainOperators(where: { operator: "${opt.operator.toLowerCase()}", approved: true }) {
          registry {
            id
          }
          owner {
            id
          }
        }
      }`,
    }),
  });
  const { data } = (await response.json()) as {
    data: {
      domainOperators: { registry: { id: Hex }; owner: { id: Address } }[];
    };
  };
  return data.domainOperators.map(({ registry, owner }) => ({
    registry: registry.id,
    owner: owner.id,
  }));
}

export function useDomainOperators(opt: { operator?: Address }) {
  return useQuery({
    queryKey: ["domainOperators", opt.operator],
    queryFn: () => fetchDomainOperators({ operator: opt.operator || "0x" }),
    enabled: Boolean(opt.operator),
  });
}
