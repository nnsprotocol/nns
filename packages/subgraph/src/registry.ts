import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Account, Domain, Registry } from "../generated/schema";
import {
  NameRegistered,
  ReverseChanged,
} from "../generated/templates/Registry/CldRegistry";

export function handleNameRegistered(event: NameRegistered): void {
  const registry = Registry.load(
    event.params.cldId.toHexString().toLowerCase()
  );
  if (registry == null) {
    log.error("Registry not found: {}", [event.address.toHexString()]);
    throw new Error("Registry not found");
  }

  let account = Account.load(event.params.owner.toHexString().toLowerCase());
  if (account == null) {
    account = new Account(event.params.owner.toHexString().toLowerCase());
    account.save();
  }

  const domain = new Domain(domainId(event.params.tokenId));
  domain.tokenId = event.params.tokenId;
  domain.name = event.params.name + "." + registry.name;
  domain.registry = registry.id;
  domain.owner = account.id;
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
  const domain = Domain.load(domainId(tokenId));
  if (!domain) {
    log.error("domain not found: {}", [tokenId.toHexString()]);
    return;
  }
  domain.resolvedAddress = address;
  domain.save();
}
