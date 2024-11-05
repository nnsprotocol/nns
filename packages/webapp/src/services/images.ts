import { Registry } from "./graph";

export function getTemplateNFTImageURL(
  name: string,
  registry: Registry
): string {
  console.log({
    name: name,
    registry: registry.name,
  });
  if (registry.name === "nouns") {
    return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nouns_dmksx2.png";
  }

  const length = Array.from(name).length;
  switch (length) {
    case 1:
    case 2:
      // Gold
      return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602782/nns/nns_gold_uy3pz1.png";
    // Silver
    case 3:
      return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nns_silver_aadanr.png";
    default:
      // Red
      return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nns_red_whxvdq.png";
  }
}
