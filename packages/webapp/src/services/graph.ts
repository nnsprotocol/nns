import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";
import { normalize } from "viem/ens";

const GRAPH_URL: string = import.meta.env.VITE_GRAPH_URL;

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
            id
            tokenId
            name
          }
        }
      `,
    }),
  });
  const { data } = await res.json();
  const domains: Record<string, unknown>[] = data?.domains || [];
  return domains.map((d: any) => ({
    id: d.id,
    tokenId: BigInt(d.tokenId),
    name: d.name,
  }));
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
