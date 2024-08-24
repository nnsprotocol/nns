import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  Domain,
  DomainOperator,
  DomainRecord,
  OwnerStats,
  Registry,
  Subdomain,
} from "../generated/schema";
import {
  Approval,
  ApprovalForAll,
  CLDRegistry,
  NameRegistered,
  NameRenewed,
  RecordSet,
  RecordsReset,
  ReverseChanged,
  SubdomainDeleted,
  SubdomainRegistered,
  Transfer,
} from "../generated/templates/Registry/CLDRegistry";
import { domainId, fetchAccount, fetchDomain, fetchRegistry } from "./shared";

function fetchRegistryByAddress(address: Address): Registry {
  const registry = CLDRegistry.bind(address);
  const v = registry.cld();
  return fetchRegistry(v.getId());
}

export function handleNameRegistered(event: NameRegistered): void {
  const registry = fetchRegistry(event.params.cldId);
  const account = fetchAccount(event.params.owner);

  const domain = new Domain(domainId(event.params.tokenId));
  domain.tokenId = event.params.tokenId;
  domain.name = event.params.name + "." + registry.name;
  domain.registry = registry.id;
  domain.owner = account.id;
  if (!event.params.expiry.isZero()) {
    domain.expiry = event.params.expiry;
  }
  domain.approval = null;
  domain.resolvedAddress = null;
  domain.save();
}

export function handleNameRenewed(event: NameRenewed): void {
  const domain = fetchDomain(event.params.tokenId);
  domain.expiry = event.params.expiry;
  domain.save();
}

export function handleReverseChanged(event: ReverseChanged): void {
  if (!event.params.fromTokenId.isZero()) {
    updateIsReverse(event.params.fromTokenId, null);
  }
  if (!event.params.toTokenId.isZero()) {
    updateIsReverse(event.params.toTokenId, event.params.account);
  }
}

function updateIsReverse(tokenId: BigInt, address: Address | null): void {
  const domain = Domain.load(domainId(tokenId));
  if (domain != null) {
    domain.resolvedAddress = address;
    domain.save();
    return;
  }

  const subdomain = Subdomain.load(tokenId.toHexString());
  if (subdomain != null) {
    subdomain.resolvedAddress = address;
    subdomain.save();
    return;
  }

  log.error("domain/subdomain not found: {}", [tokenId.toHexString()]);
  throw new Error("Domain/Subdomain not found");
}

export function handleApproval(event: Approval): void {
  const domain = fetchDomain(event.params.tokenId);

  if (event.params.approved.equals(Address.zero())) {
    domain.approval = null;
  } else {
    const approvedAccount = fetchAccount(event.params.approved);
    domain.approval = approvedAccount.id;
  }

  domain.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  const registry = fetchRegistryByAddress(event.address);
  const operator = fetchAccount(event.params.operator);
  const owner = fetchAccount(event.params.owner);

  const id = registry.id + "-" + owner.id + "-" + operator.id;
  const delegation = new DomainOperator(id);
  delegation.registry = registry.id;
  delegation.owner = owner.id;
  delegation.operator = operator.id;
  delegation.approved = event.params.approved;
  delegation.save();
}

function loadOrCreateOwnerStats(
  accountId: string,
  registryId: string
): OwnerStats {
  const id = accountId + ":" + registryId;
  let stats = OwnerStats.load(id);
  if (stats == null) {
    stats = new OwnerStats(id);
    stats.registry = registryId;
    stats.owner = accountId;
    stats.numberOfTokens = BigInt.zero();
    stats.save();
  }
  return stats;
}

export function handleTransfer(event: Transfer): void {
  const registry = fetchRegistryByAddress(event.address);

  const ONE = BigInt.fromI32(1);

  // Mint
  if (event.params.from.equals(Address.zero())) {
    // The creation of the domain is handled by the NameRegistered event
    registry.totalSupply = registry.totalSupply.plus(ONE);
  }
  // Burn
  else if (event.params.to.equals(Address.zero())) {
    registry.totalSupply = registry.totalSupply.minus(ONE);
  }
  // Transfer
  else {
    // Clean the domain properties which are cleared during the transfer
    let domain = fetchDomain(event.params.tokenId);
    let to = fetchAccount(event.params.to);
    domain.owner = to.id;
    domain.approval = null;
    domain.resolvedAddress = null;
    domain.save();
  }

  const fromStats = updateNumberOfTokensForOwner(
    event.params.from,
    registry.id,
    ONE.neg()
  );
  if (fromStats != null && fromStats.numberOfTokens.isZero()) {
    // The old owner has no more domains.
    registry.uniqueOwners = registry.uniqueOwners.minus(ONE);
  }

  const toStats = updateNumberOfTokensForOwner(
    event.params.to,
    registry.id,
    ONE
  );
  if (toStats != null && toStats.numberOfTokens.equals(ONE)) {
    // The new owner has the first domain.
    registry.uniqueOwners = registry.uniqueOwners.plus(ONE);
  }

  registry.save();
}

function updateNumberOfTokensForOwner(
  account: Address,
  registryId: string,
  delta: BigInt
): OwnerStats | null {
  if (account.equals(Address.zero())) {
    return null;
  }

  const stats = loadOrCreateOwnerStats(account.toHexString(), registryId);
  stats.numberOfTokens = stats.numberOfTokens.plus(delta);
  stats.save();
  return stats;
}

function domainRecordId(domainId: BigInt, key: BigInt): string {
  return domainId.toHexString() + "-" + key.toHexString();
}

function deleteDomainRecord(recordId: string): void {
  store.remove("DomainRecord", recordId);
}

export function handleRecordSet(event: RecordSet): void {
  const recordId = domainRecordId(event.params.tokenId, event.params.keyHash);
  let record = DomainRecord.load(recordId);
  if (record === null && event.params.value.length === 0) {
    return;
  }
  if (record === null && event.params.value.length > 0) {
    record = new DomainRecord(recordId);
    record.domain = domainId(event.params.tokenId);
    record.key = event.params.keyHash;
    record.value = event.params.value;
    record.save();
    return;
  }
  if (record === null) {
    return;
  }

  if (event.params.value.length === 0) {
    deleteDomainRecord(recordId);
    return;
  }

  record.value = event.params.value;
  record.save();
}

export function handleRecordsReset(event: RecordsReset): void {
  let records: DomainRecord[] = [];
  const domain = Domain.load(domainId(event.params.tokenId));
  if (domain != null) {
    records = domain.records.load();
  }
  if (domain == null) {
    const subdomain = Subdomain.load(domainId(event.params.tokenId));
    if (subdomain == null) {
      log.error("domain/subdomain not found: {}", [
        event.params.tokenId.toHexString(),
      ]);
      throw new Error("Domain/Subdomain not found");
    }
    records = subdomain.records.load();
  }

  for (let i = 0; i < records.length; i++) {
    deleteDomainRecord(records[i].id);
  }
}

export function handleSubdomainRegistered(event: SubdomainRegistered): void {
  const domain = fetchDomain(event.params.parentTokenId);

  const subdomain = new Subdomain(domainId(event.params.subdomainId));
  subdomain.tokenId = event.params.subdomainId;
  subdomain.name = event.params.name;
  subdomain.parent = domain.id;
  subdomain.resolvedAddress = null;
  subdomain.save();
}

export function handleSubdomainDeleted(event: SubdomainDeleted): void {
  store.remove("Subdomain", domainId(event.params.subdomainId));
}
