import { describe, test, expect } from "@jest/globals";
import { NNS_OWNER, NOUNS_COIN_OWNER, randomAddress } from "./shared";
import registerHandler from "../register/sign";
import { Request } from "lambda-api";

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
        labels: ["notyetregister11232", "nouns"],
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
        labels: ["notyetregister11232", "nouns"],
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
    const op = registerHandler({
      body: t.request,
    } as unknown as Request);

    if (t.response.status >= 400) {
      await expect(op).rejects.toThrow();
      return;
    }

    const response = await op;
    if (t.response.price === "zero") {
      expect(BigInt(response.price)).toEqual(0n);
    }
    if (t.response.price === "non-zero") {
      expect(BigInt(response.price)).toBeGreaterThan(0n);
    }
  });
});
