import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, test, expect } from "vitest";
import worker from "../src";
import { NNS_OWNER, NOUNS_COIN_OWNER, randomAddress } from "./shared";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Registration - Register", () => {
  test.each([
    {
      test: "fails when v1 domain is owned by someone else",
      cld: "⌐◨-◨",
      request: {
        to: randomAddress(),
        labels: ["dotnouns", "⌐◨-◨"],
        withReverse: true,
        referer: randomAddress(),
        periods: 1,
      },
      response: {
        status: 409,
      },
    },
    {
      test: "zero price when the v1 domain is owned",
      cld: "⌐◨-◨",
      request: {
        to: NNS_OWNER,
        labels: ["2707", "⌐◨-◨"],
        withReverse: true,
        referer: randomAddress(),
        periods: 0,
      },
      response: {
        status: 200,
        price: "zero",
      },
    },
    {
      test: "non-zero price when the v1 domain does not exist",
      cld: "⌐◨-◨",
      request: {
        to: NNS_OWNER,
        labels: ["idonotexistandhopefullyneverwill", "⌐◨-◨"],
        withReverse: true,
        referer: randomAddress(),
        periods: 0,
      },
      response: {
        status: 200,
        price: "non-zero",
      },
    },
    {
      test: "fails when Noun is owned by someone else",
      cld: "nouns",
      request: {
        to: randomAddress(),
        labels: ["1", "nouns"],
        withReverse: true,
        referer: randomAddress(),
        periods: 0,
      },
      response: {
        status: 409,
      },
    },
    {
      test: "fails when wallet has no Nouns or $NOUN",
      cld: "nouns",
      request: {
        to: randomAddress(),
        labels: ["apbigcod", "nouns"],
        withReverse: true,
        referer: randomAddress(),
        periods: 0,
      },
      response: {
        status: 409,
      },
    },
    {
      test: "price is non-zero",
      cld: "nouns",
      request: {
        to: NOUNS_COIN_OWNER,
        labels: ["apbigcod", "nouns"],
        withReverse: true,
        referer: randomAddress(),
        periods: 0,
      },
      response: {
        status: 200,
        price: "non-zero",
      },
    },
  ])("$cld - $test", async (t) => {
    const request = new IncomingRequest("http://nns.com/register", {
      method: "POST",
      body: JSON.stringify(t.request),
    });

    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);

    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(t.response.status);
    const body = await response.json();
    if (t.response.price === "zero") {
      expect(body.price).toBe("0x0");
    }
    if (t.response.price === "non-zero") {
      expect(BigInt(body.price)).toBeGreaterThan(0n);
    }
  });
});
