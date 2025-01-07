import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Account, Domain, GlobalStats, Registry } from "../generated/schema";

export const ONE = BigInt.fromU32(1);

export function fetchAccount(address: Address): Account {
  let account = Account.load(address.toHexString());
  if (account == null) {
    account = new Account(address.toHexString());
    account.numberOfDomains = BigInt.zero();
    account.save();
  }
  return account;
}

export function domainId(tokenId: BigInt): string {
  return tokenId.toHexString();
}

export function fetchDomain(tokenId: BigInt): Domain {
  const domain = Domain.load(domainId(tokenId));
  if (!domain) {
    log.error("domain not found: {}", [tokenId.toHexString()]);
    throw new Error("Domain not found");
  }
  return domain;
}

export function registryId(cldId: BigInt): string {
  return cldId.toHexString();
}

export function fetchRegistry(cldId: BigInt): Registry {
  const registry = Registry.load(registryId(cldId));
  if (registry == null) {
    log.error("Registry not found: {}", [registryId(cldId)]);
    throw new Error("Registry not found");
  }
  return registry;
}

export function fetchGlobalStats(): GlobalStats {
  let stats = GlobalStats.load("nns");
  if (stats == null) {
    stats = new GlobalStats("nns");
    stats.totalSupply = BigInt.zero();
    stats.domainsSold = BigInt.zero();
    stats.registries = BigInt.zero();
    stats.resolvers = BigInt.zero();
    stats.save();
  }
  return stats;
}
