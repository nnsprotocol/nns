import { useMemo } from "react";
import { Hex, isHex, namehash } from "viem";

export type CollectionData = {
  cldId: Hex;
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
    imageSrc: string;
    title: string;
    description: string;
    revenues: {
      iconSrc: string;
      name: string;
      share: number;
      themeColor: string;
    }[];
  };
};

const COLLECTIONS: Record<string, CollectionData> = {
  nouns: {
    cldId: namehash("nouns"),
    name: "Nouns",
    description:
      "The .nouns is a special domain reserved to members of NounsDAO and $nouns holders. 0-9999 numbers are claimable only by the owner of the correspondent Noun.",
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
      imageSrc: "/brand/nouns-benefits.png",
      title: "Exclusive and nounish",
      description:
        ".nouns names are reserved to Nouns NFTs and $nouns token holders.",
      revenues: [
        {
          iconSrc: "/temp/noun-1.svg",
          name: "Nouns DAO",
          share: 80,
          themeColor: "#E9C80B",
        },
        {
          iconSrc: "/temp/ecosystem.svg",
          name: "Ecosystem",
          share: 25,
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
  },
  nns: {
    cldId: namehash("⌐◨-◨"),
    name: "NNS",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
      imageSrc: "/brand/nns-benefits.png",
      title: "Lorem Ipsum",
      description: ".⌐◨-◨ hello",
      revenues: [
        {
          iconSrc: "/temp/noun-1.svg",
          name: "NNS",
          share: 35,
          themeColor: "#E9C80B",
        },
        {
          iconSrc: "/temp/ecosystem.svg",
          name: "Ecosystem",
          share: 65,
          themeColor: "#828187",
        },
      ],
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
