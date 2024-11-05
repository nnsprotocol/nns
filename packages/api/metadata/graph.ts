import { Address } from "viem";

const SEPOLIA_GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns-sepolia/live/gn";

const MAINNET_GRAPH_URL =
  "https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/live/gn";

export async function fetchTokenInfo(req: {
  chainId: number;
  contract: Address;
  tokenId: bigint;
}): Promise<{ name: string; type: "domain" | "resolverToken" } | null> {
  const url = req.chainId === 8453 ? MAINNET_GRAPH_URL : SEPOLIA_GRAPH_URL;

  const res = await fetch(url, {
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
        resolverTokens(
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
    resolverToken: { name: string }[];
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
  if (body.data?.resolverToken[0]) {
    return {
      name: body.data?.resolverToken[0].name,
      type: "resolverToken",
    };
  }
  return null;
}
