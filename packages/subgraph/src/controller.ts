import { CldRegistered } from "../generated/NNSController/NNSController";
import { Registry, RegistryAddressIdLookup } from "../generated/schema";
import { Registry as RegistryTemplate } from "../generated/templates";

export function handleCldRegistered(event: CldRegistered): void {
  const r = new Registry(event.params.cldId.toHexString().toLowerCase());
  r.name = event.params.name;
  r.address = event.params.registry;
  r.save();

  const lup = new RegistryAddressIdLookup(
    event.params.registry.toHexString().toLowerCase()
  );
  lup.cldId = event.params.cldId;
  lup.save();

  RegistryTemplate.create(event.params.registry);
}
