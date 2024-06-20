import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Account,
  Domain,
  DomainOperator,
  Registry,
  RegistryAddressIdLookup,
} from "../generated/schema";
import {
  Approval,
  ApprovalForAll,
  NameRegistered,
  ReverseChanged,
} from "../generated/templates/Registry/CldRegistry";

function fetchAccount(address: Address): Account {
  let account = Account.load(address.toHexString().toLowerCase());
  if (account == null) {
    account = new Account(address.toHexString().toLowerCase());
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
  const registry = Registry.load(cldId.toHexString().toLowerCase());
  if (registry == null) {
    log.error("Registry not found: {}", [cldId.toHexString()]);
    throw new Error("Registry not found");
  }
  return registry;
}

function fetchRegistryByAddress(address: Address): Registry {
  const lup = RegistryAddressIdLookup.load(address.toHexString().toLowerCase());
  if (lup == null) {
    log.error("Registry not found: {}", [address.toHexString()]);
    throw new Error("Registry lookup not found");
  }
  return fetchRegistry(lup.cldId);
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
  return tokenId.toHexString().toLowerCase();
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
  const domain = fetchDomain(tokenId);
  domain.resolvedAddress = address;
  domain.save();
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
