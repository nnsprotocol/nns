import { expect } from "chai";
import { parseEther, parseUnits } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const conversionRate = 2n;
  const aggregatorF = await ethers.getContractFactory("USDETHAggregatorMock");
  const aggregator = await aggregatorF.deploy(conversionRate);

  const prices = [parseEther("50"), parseEther("20"), parseEther("10")];

  const oracleF = await ethers.getContractFactory("USDPricingOracle");
  const oracle = await oracleF.deploy(prices, aggregator);
  return {
    conversionRate,
    oracle,
    prices,
  };
}

describe("USDPricingOracle", () => {
  const tests = [
    {
      description: "1 letter",
      name: "a",
      priceIdx: 0,
    },
    {
      description: "2 letters",
      name: "ab",
      priceIdx: 1,
    },
    {
      description: "3 letters",
      name: "abc",
      priceIdx: 2,
    },
    {
      description: "4 letters",
      name: "abcd",
      priceIdx: 2, // capped
    },
    {
      description: "5 letters",
      name: "abcde",
      priceIdx: 2,
    },
  ];
  for (const t of tests) {
    describe(t.description, () => {
      it("returns the correct price", async () => {
        const ctx = await setup();
        const priceInUSD = ctx.prices[t.priceIdx];
        const p = await ctx.oracle.price(t.name);
        expect(p).to.equal(priceInUSD / ctx.conversionRate);
      });
    });
  }
});
