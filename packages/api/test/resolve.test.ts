import { describe, expect, test } from "@jest/globals";
import { Request } from "lambda-api";
import { namehash } from "viem";
import resolveHandler from "../resolver/resolve";

describe("Registration - Register", () => {
  test.each([
    {
      test: "has v2 name",
      request: {
        address: "0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036",
      },
      expName: "2707.⌐◨-◨",
    },
    {
      test: "only has v1 name",
      request: {
        // Randomly picked from opensea. Has 9488.⌐◨-◨ but no v2 name yet. Could fail at some point.
        address: "0x03DB74Df4Ef8b29fe210abcf027C757747C14f00",
      },
      expName: null,
    },
    {
      test: "only has eth name",
      request: {
        // Randomly picked from opensea. Has ooooo1.eth and no NNS.
        address: "0xBBF61308d129ee97578Dce421A60F49354F0f4Dd",
      },
      expName: "ooooo1.eth",
    },
    {
      test: "no v2 name disabling v1",
      request: {
        address: "0x03DB74Df4Ef8b29fe210abcf027C757747C14f00",
        disable_v1: true,
      },
      expName: null,
    },
    {
      test: "specific cld, no fallback",
      request: {
        // this account only has 2707.⌐◨-◨
        address: "0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036",
        clds: [namehash("nouns")],
        fallback: false,
        disable_v1: true,
      },
      expName: null,
    },
    {
      test: "specific cld, with fallback",
      request: {
        // this account only has 2707.⌐◨-◨
        address: "0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036",
        clds: [namehash("nouns")],
        disable_v1: true,
      },
      expName: "2707.⌐◨-◨",
    },
  ])("$test", async (t) => {
    const res = await resolveHandler({
      body: t.request,
    } as unknown as Request);

    expect(res.name).toBe(t.expName);
  });
});
