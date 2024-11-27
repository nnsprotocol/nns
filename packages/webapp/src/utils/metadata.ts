import { Domain } from "../services/graph";

export function getDomainImageURL(chainId: number, domain: Domain) {
  return `https://d321vfgto7sq2r.cloudfront.net/${chainId}/${domain.registry.address}/${domain.tokenId}/image`;
}
