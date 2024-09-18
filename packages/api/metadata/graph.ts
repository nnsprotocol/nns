import { Address } from "viem";

const GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/0.0.2/gn";

export async function fetchName(req: {
  contract: Address;
  tokenId: bigint;
}): Promise<string | null> {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        domains(
          where: {
            registry_: { address: "${req.contract.toLowerCase()}" }
            tokenId: "${req.tokenId.toString(10)}"
          }
        ) {
          name
        } 
      }`,
    }),
  });
  const body = (await res.json()) as {
    data: { domains: { name: string }[] } | null;
  };

  return body.data?.domains[0]?.name ?? null;
}
