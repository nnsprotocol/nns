import { useMemo } from "react";
import { Hex, isHex, namehash } from "viem";

export type CollectionData = {
  cldId: Hex;
  cld: string;
  name: string;
  description: string;
  themeColor: string;
  textColor: string;
  nameImgSrc: string;
  logoSrc: string;
  nnsFontLogoUrl: string;
  twitterUrl?: string;
  discordUrl?: string;
  farcasterUrl?: string;
  benefits: {
    header: string;
    revenues: {
      iconSrc: string;
      name: string;
      share: number;
      themeColor: string;
    }[];
  };
  nameDescription: (name: string) => string;
};

const COLLECTIONS: Record<string, CollectionData> = {
  nouns: {
    cldId: namehash("nouns"),
    cld: "nouns",
    name: "Nouns",
    description:
      "Exclusive and nounish, .nouns names can only be claimed by holders of Nouns NFTs or $NOUNS tokens. Numbers 0-9999 are reserved for the holders of the corresponding Noun and can only be claimed by them.",
    themeColor: "#E9C80B",
    textColor: "#000000",
    nameImgSrc: "/logo-nouns.svg",
    logoSrc: "/temp/noun-1.svg",
    nnsFontLogoUrl: "/logo-nouns.svg",
    discordUrl: undefined,
    twitterUrl: undefined,
    farcasterUrl: undefined,
    benefits: {
      header: "Learn more about .nouns names",
      revenues: [
        {
          iconSrc: "/temp/noun-1.svg",
          name: "Nouns DAO",
          share: 70,
          themeColor: "#E9C80B",
        },
        {
          iconSrc: "/temp/ecosystem.svg",
          name: "Ecosystem",
          share: 10,
          themeColor: "#828187",
        },
        {
          iconSrc: "/temp/nns.svg",
          name: "NNS",
          share: 5,
          themeColor: "#C496FF",
        },
      ],
    },
    nameDescription: (name: string) => {
      if (parseInt(name) >= 0 && parseInt(name) < 9999) {
        return "This name can only be claimed by the owner of the corresponding Noun";
      }
      switch (Array.from(name).length) {
        case 1:
          return "This is one of the rarest (and most expensive) names!";
        case 2:
          return "The rarer the name, the higher the price";
        case 3:
          return "A perfect mix of rarity and affordability";
        default:
          return "Great name! Claim it before someone else does!";
      }
    },
  },
  nns: {
    cldId: namehash("⌐◨-◨"),
    cld: "⌐◨-◨",
    name: "NNS",
    description:
      "Owning a .⌐◨-◨ name will give you access to an ever increasing amount of benefits and utilities. Unlock referral rewards, be instantly recognizable, and earn $NOGS all while spreading the ⌐◨-◨.",
    themeColor: "#C496FF",
    textColor: "#000000",
    nameImgSrc: "/logo-nns.svg",
    logoSrc: "/temp/nns.svg",
    discordUrl: undefined,
    twitterUrl: undefined,
    farcasterUrl: undefined,
    nnsFontLogoUrl: "/logo.svg",
    benefits: {
      header: "Learn more about .⌐◨-◨ names",
      revenues: [
        {
          iconSrc: "/temp/nns.svg",
          name: "NNS",
          share: 5,
          themeColor: "#E9C80B",
        },
        {
          iconSrc: "/temp/ecosystem.svg",
          name: "Ecosystem",
          share: 60,
          themeColor: "#828187",
        },
      ],
    },
    nameDescription: (name: string) => {
      switch (Array.from(name).length) {
        case 2:
          return "The rarer the name, the higher the price!";
        case 3:
          return "A perfect mix of rarity and affordability";
        default:
          return "Great name! Claim it before someone else does!";
      }
    },
  },
};

export function useCollectionData(nameOrCldId?: string) {
  return useMemo(() => {
    if (!nameOrCldId) {
      return undefined;
    }
    if (isHex(nameOrCldId)) {
      return findCollectionByCldId(nameOrCldId as Hex);
    }
    return COLLECTIONS[nameOrCldId];
  }, [nameOrCldId]);
}

function findCollectionByCldId(id: Hex) {
  return Object.values(COLLECTIONS).find(
    (collection) => collection.cldId.toLowerCase() === id.toLowerCase()
  );
}

export function getCollectionLogoURL(cldId: Hex) {
  return findCollectionByCldId(cldId)?.logoSrc;
}
