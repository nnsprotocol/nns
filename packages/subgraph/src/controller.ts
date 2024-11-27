import { BigInt } from "@graphprotocol/graph-ts";
import {
  CldRegistered,
  CldSignatureRequiredChanged,
} from "../generated/NNSController/NNSController";
import { Registry } from "../generated/schema";
import { Registry as RegistryTemplate } from "../generated/templates";
import { fetchRegistry } from "./shared";

export function handleCldRegistered(event: CldRegistered): void {
  const r = new Registry(event.params.cldId.toHexString());
  r.name = event.params.name;
  r.address = event.params.registry;
  r.hasExpiringNames = event.params.hasExpiringNames;
  r.totalSupply = BigInt.zero();
  r.uniqueOwners = BigInt.zero();
  r.registrationWithSignature = false;

  r.save();

  RegistryTemplate.create(event.params.registry);
}

export function handleCldSignatureRequiredChanged(
  event: CldSignatureRequiredChanged
): void {
  const r = fetchRegistry(event.params.cldId);
  r.registrationWithSignature = event.params.required;
  r.save();
}
