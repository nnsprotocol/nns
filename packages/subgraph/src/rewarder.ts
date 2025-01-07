import { Collected } from "../generated/NNSRewarder/IRewarder";
import { fetchGlobalStats, fetchRegistry, ONE } from "./shared";

export function handleCollected(event: Collected): void {
  if (event.params.amountEth.isZero()) {
    return;
  }

  const registry = fetchRegistry(event.params.cldId);
  registry.domainsSold = registry.domainsSold.plus(ONE);
  registry.save();

  const stats = fetchGlobalStats();
  stats.domainsSold = stats.domainsSold.plus(ONE);
  stats.save();
}
