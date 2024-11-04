import { Address, log, store } from "@graphprotocol/graph-ts";
import {
  Transfer,
  NNSResolverToken,
} from "../generated/NNSResolverToken/NNSResolverToken";
import { ResolverToken } from "../generated/schema";
import { fetchAccount } from "./shared";

export function handleTransfer(event: Transfer): void {
  const id = event.params.tokenId.toHexString();

  // Mint
  if (event.params.from.equals(Address.zero())) {
    const rt = new ResolverToken(id);
    rt.tokenId = event.params.tokenId;
    rt.name = NNSResolverToken.bind(event.address).nameOf(event.params.tokenId);
    rt.owner = fetchAccount(event.params.to).id;
    rt.save();
    return;
  }

  // Burn
  if (event.params.to.equals(Address.zero())) {
    store.remove("ResolverToken", id);
    return;
  }

  // Normal transfer
  const rt = ResolverToken.load(id);
  if (!rt) {
    log.error("resolving token not found: {}", [id]);
    throw new Error("Resolving token not found");
  }
  rt.owner = fetchAccount(event.params.to).id;
  rt.save();
}
