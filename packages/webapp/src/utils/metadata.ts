import { Domain } from "../services/graph";

export function getDomainImageURL(domain: Domain) {
  return `https://d321vfgto7sq2r.cloudfront.net/${84532}/${
    domain.registry.address
  }/${domain.tokenId}/image`;
}
