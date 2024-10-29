import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, test } from "vitest";
import worker from "../src";
import {
  NNS_OWNER,
  NOUNS_COIN_OWNER,
  NOUNS_NFT_OWNER,
  randomAddress,
} from "./shared";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

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
      test: "domains shorten than 2 else cannot be registered",
      name: "x",
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
      test: "names can be registered when they exist in NNS v1 and belong to the same account",
      name: "nogs",
      cld: "nouns",
      owner: "0x73E09de9497f2dfFf90B1e97aC0bE9cccA1677Ec",
      exp: {
        canRegister: true,
        isFree: false,
      },
    },
  ])("$cld - $test", async (t) => {
    const request = new IncomingRequest(
      `http://nns.com/availability?to=${t.owner}&cld=${t.cld}&name=${t.name}`
    );

    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);

    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(t.exp);
  });
});
