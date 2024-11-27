import { DefaultCldChanged } from "../generated/NNSResolver/NNSResolver";
import { fetchAccount, registryId } from "./shared";

export function handleDefaultCldChanged(event: DefaultCldChanged): void {
  const account = fetchAccount(event.params.account);
  account.defaultResolverRegistry = registryId(event.params.cldId);
  account.save();
}
