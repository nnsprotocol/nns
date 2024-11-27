import { describe, expect, test } from "@jest/globals";
import { Request } from "lambda-api";
import {
  NNS_OWNER,
  NNS_STAKED_NAME,
  NNS_STAKED_OWNER,
  NOUNS_COIN_OWNER,
  NOUNS_NFT_OWNER,
  randomAddress,
} from "./shared";
import availabilityHandler from "../register/availability";

describe("Registration - Availability", () => {
  test.each([
    {
      test: "domains owned by someone else cannot be registered",
      name: "apbigcod",
      cld: "⌐◨-◨",
      owner: NNS_OWNER,
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "domains owned can be registered for free",
      name: "2707",
      cld: "⌐◨-◨",
      owner: NNS_OWNER,
      exp: {
        canRegister: true,
        isFree: true,
      },
    },
    {
      test: "domains never registered can be register for a fee",
      name: "idonotexistidonotexistidonotexistidonotexist",
      cld: "⌐◨-◨",
      owner: NNS_OWNER,
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
    {
      test: "staked names can be registered for free by the owner",
      name: NNS_STAKED_NAME,
      cld: "⌐◨-◨",
      owner: NNS_STAKED_OWNER,
      exp: {
        canRegister: true,
        isFree: true,
      },
    },
    {
      test: "staked names cannot be registered by other wallets",
      // NOTE: this is a volatile test as the name could be unstaked at any time.
      name: NNS_STAKED_NAME,
      cld: "⌐◨-◨",
      owner: randomAddress(),
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "owner of the associated nouns can register the same domain for a free",
      name: "1012",
      cld: "nouns",
      owner: NOUNS_NFT_OWNER,
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
    {
      test: "another acount cannot register the same domain for another nouns",
      name: "1",
      cld: "nouns",
      owner: NOUNS_NFT_OWNER,
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "another acount cannot register the same domain for another nouns",
      name: "1",
      cld: "nouns",
      owner: NOUNS_NFT_OWNER,
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "names can be registered for free when the account has Nouns",
      name: "notregisteredyet",
      cld: "nouns",
      owner: NOUNS_NFT_OWNER,
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
    {
      test: "names can be registered for a free when the account has a $NOUN tokens",
      name: "notregisteredyet",
      cld: "nouns",
      owner: NOUNS_COIN_OWNER,
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
    {
      test: "names cannot be registered when the account has no Nouns or $NOUN tokens",
      name: "notregisteredyet",
      cld: "nouns",
      owner: randomAddress(),
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "names cannot be registered when they exist in NNS v1 and belong to another account",
      name: "dotnouns",
      cld: "nouns",
      owner: randomAddress(),
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "names can be registered when they exist in NNS v1 and belong to the same account even without tokens",
      name: "apbigcod",
      cld: "nouns",
      // this wallet owns apbigcod in NNS v1 and has no Nouns or $NOUN tokens
      owner: "0xC556e77AFb1ddB024506413765f106F0d9156F70",
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
    {
      test: "names can be registered when they are staked in NNS v1 and belong to the same account even without tokens",
      name: NNS_STAKED_NAME,
      cld: "nouns",
      owner: NNS_STAKED_OWNER,
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
  ])("$cld - $test", async (t) => {
    const output = await availabilityHandler({
      query: {
        to: t.owner,
        cld: t.cld,
        name: t.name,
      },
    } as unknown as Request);

    expect(output).toEqual(t.exp);
  });
});
