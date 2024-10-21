import { Address } from "viem";

const GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/0.0.2/gn";

export async function fetchTokenInfo(req: {
  contract: Address;
  tokenId: bigint;
}): Promise<{ name: string; type: "domain" | "resolvingToken" } | null> {
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
        resolvingTokens(
          where: {
            tokenId: "${req.tokenId.toString(10)}"
          }
        ) {
          name
        } 
      }`,
    }),
  });
  type Response = {
    domains: { name: string }[];
    resolvingTokens: { name: string }[];
  };
  const body = (await res.json()) as {
    data: Response | null;
  };

  if (body.data?.domains[0]) {
    return {
      name: body.data?.domains[0].name,
      type: "domain",
    };
  }
  if (body.data?.resolvingTokens[0]) {
    return {
      name: body.data?.resolvingTokens[0].name,
      type: "resolvingToken",
    };
  }
  return null;
}
