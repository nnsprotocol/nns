import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, test, expect } from "vitest";
// Could import any other source file/function here
import worker from "../src";
import { Address } from "viem";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Registration - Availability", () => {
  /** NNS_OWNER owns 2707.⌐◨-◨ */
  const NNS_OWNER = "0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036";
  /** NOUNS_NFT_OWNER owns Nouns 1012 */
  const NOUNS_NFT_OWNER = "0x73E09de9497f2dfFf90B1e97aC0bE9cccA1677Ec";
  /** NOUNS_COIN_OWNER owns some $NOUN and no Nouns */
  const NOUNS_COIN_OWNER = "0x338f3E577312F90A74754dddd0D7568C2c3DC211";

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
      test: "names shorter than 3 cannot be registered",
      name: "ab",
      cld: "nouns",
      owner: NOUNS_NFT_OWNER,
      exp: {
        canRegister: false,
        isFree: false,
      },
    },
    {
      test: "names can be registered for a free when the account has Nouns",
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
      owner: NNS_OWNER,
      exp: {
        canRegister: false,
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
