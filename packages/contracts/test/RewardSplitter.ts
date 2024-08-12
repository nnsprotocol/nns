import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers, network } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3] = await ethers.getSigners();

  const tokenF = await ethers.getContractFactory("NNSResolverToken");
  const token = await tokenF.deploy();

  const spltterF = await ethers.getContractFactory("RewardSplitter");
  const splitter = await spltterF.deploy(token, 10000);

  return {
    token,
    owner,
    w1,
    w2,
    w3,
    splitter,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("RewardSplitter", () => {
  describe("erc721", () => {
    it("returns the token address", async () => {
      const ctx = await setup();
      const addr = await ctx.splitter.erc721();
      expect(addr).to.eq(ctx.token);
    });
  });

  describe("takeSnapshot", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.splitter.connect(ctx.w1).takeSnapshot(123);
      await expect(op).to.be.revertedWithCustomError(
        ctx.splitter,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("issueReward", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.splitter.connect(ctx.w1).issueReward(ctx.w2, 123);
      await expect(op).to.be.revertedWithCustomError(
        ctx.splitter,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
