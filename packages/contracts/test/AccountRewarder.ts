import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3, w4, w5] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("AccountRewarder");
  const rewarder = await factory.deploy();

  return {
    rewarder,
    owner,
    w1,
    w2,
    w3,
    w4,
    w5,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("AccountRewarder", () => {
  describe("incrementBalanceOf", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.rewarder
        .connect(ctx.w1)
        .incrementBalanceOf(ctx.w1.address, 100);
      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        ctx = await setup();
        tx = await ctx.rewarder
          .connect(ctx.owner)
          .incrementBalanceOf(ctx.w1.address, 100);
      });

      it("increments the balance of the account", async () => {
        expect(await ctx.rewarder.balanceOf(ctx.w1.address)).to.eq(100);
      });

      it("emits a BalanceChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "BalanceChanged")
          .withArgs(ctx.w1.address, 0, 100);
      });
    });
  });

  describe("issueReward", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.rewarder.connect(ctx.w1).issueReward(ctx.w1.address);
      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        ctx = await setup();
        await ctx.rewarder
          .connect(ctx.owner)
          .incrementBalanceOf(ctx.w1.address, 100);
        tx = await ctx.rewarder.connect(ctx.owner).issueReward(ctx.w1.address);
      });

      it("emits a RewardClaimed event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "RewardClaimed")
          .withArgs(ctx.w1.address, 100);
      });

      it("resets the balance of the account", async () => {
        expect(await ctx.rewarder.balanceOf(ctx.w1.address)).to.eq(0);
      });
    });
  });
});
