import { Address, log, store } from "@graphprotocol/graph-ts";
import {
  Transfer,
  NNSResolverToken,
} from "../generated/NNSResolverToken/NNSResolverToken";
import { ResolverToken } from "../generated/schema";
import { fetchAccount, fetchGlobalStats, ONE } from "./shared";

export function handleTransfer(event: Transfer): void {
  const id = event.params.tokenId.toHexString();
  const globalStats = fetchGlobalStats();

  // Mint
  if (event.params.from.equals(Address.zero())) {
    const rt = new ResolverToken(id);
    rt.tokenId = event.params.tokenId;
    rt.name = NNSResolverToken.bind(event.address).nameOf(event.params.tokenId);
    rt.owner = fetchAccount(event.params.to).id;
    rt.save();

    globalStats.resolvers = globalStats.resolvers.plus(ONE);
    globalStats.save();
    return;
  }

  // Burn
  if (event.params.to.equals(Address.zero())) {
    store.remove("ResolverToken", id);
    globalStats.resolvers = globalStats.resolvers.minus(ONE);
    globalStats.save();
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
