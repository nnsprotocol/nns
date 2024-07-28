import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  Account,
  Domain,
  DomainOperator,
  DomainRecord,
  Registry,
  Subdomain,
} from "../generated/schema";
import {
  Approval,
  ApprovalForAll,
  CldRegistry,
  NameRegistered,
  RecordSet,
  RecordsReset,
  ReverseChanged,
  SubdomainDeleted,
  SubdomainRegistered,
  Transfer,
} from "../generated/templates/Registry/CldRegistry";

function fetchAccount(address: Address): Account {
  let account = Account.load(address.toHexString());
  if (account == null) {
    account = new Account(address.toHexString());
    account.save();
  }
  return account;
}

function fetchDomain(tokenId: BigInt): Domain {
  const domain = Domain.load(domainId(tokenId));
  if (!domain) {
    log.error("domain not found: {}", [tokenId.toHexString()]);
    throw new Error("Domain not found");
  }
  return domain;
}

function fetchRegistry(cldId: BigInt): Registry {
  const registry = Registry.load(cldId.toHexString());
  if (registry == null) {
    log.error("Registry not found: {}", [cldId.toHexString()]);
    throw new Error("Registry not found");
  }
  return registry;
}

function fetchRegistryByAddress(address: Address): Registry {
  const registry = CldRegistry.bind(address);
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
  domain.approval = null;
  domain.resolvedAddress = null;
  domain.save();
}

function domainId(tokenId: BigInt): string {
  return tokenId.toHexString();
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

export function handleTransfer(event: Transfer): void {
  if (event.params.from.equals(Address.zero())) {
    // newly minted domain. This is handled by handleNameRegistered.
    return;
  }

  let domain = fetchDomain(event.params.tokenId);
  let to = fetchAccount(event.params.to);
  domain.owner = to.id;
  domain.approval = null;
  domain.resolvedAddress = null;
  domain.save();
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
