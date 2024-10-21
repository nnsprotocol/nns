import { Address, log, store } from "@graphprotocol/graph-ts";
import {
  Transfer,
  NNSResolvingToken,
} from "../generated/NNSResolvingToken/NNSResolvingToken";
import { ResolvingToken } from "../generated/schema";
import { fetchAccount } from "./shared";

export function handleTransfer(event: Transfer): void {
  const id = event.params.tokenId.toHexString();

  // Mint
  if (event.params.from.equals(Address.zero())) {
    const rt = new ResolvingToken(id);
    rt.tokenId = event.params.tokenId;
    rt.name = NNSResolvingToken.bind(event.address).nameOf(
      event.params.tokenId
    );
    rt.owner = fetchAccount(event.params.to).id;
    rt.save();
    return;
  }

  // Burn
  if (event.params.to.equals(Address.zero())) {
    store.remove("ResolvingToken", id);
    return;
  }

  // Normal transfer
  const rt = ResolvingToken.load(id);
  if (!rt) {
    log.error("resolving token not found: {}", [id]);
    throw new Error("Resolving token not found");
  }
  rt.owner = fetchAccount(event.params.to).id;
  rt.save();
}
