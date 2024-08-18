import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { IERC721BasedRewarder } from "../typechain-types";

async function setup() {
  const [owner, w1, w2, w3, w4, w5] = await ethers.getSigners();

  const tokenF = await ethers.getContractFactory("ERC721Mock");
  const token = await tokenF.deploy();

  const minSnapshotInterval = 1284;

  const factory = await ethers.getContractFactory("ERC721BasedRewarder");
  const rewarder = await factory.deploy(token, minSnapshotInterval);

  return {
    rewarder,
    token,
    owner,
    minSnapshotInterval,
    w1,
    w2,
    w3,
    w4,
    w5,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("ERC721BasedRewarder", () => {
  describe("erc721", () => {
    it("returns the token address", async () => {
      const ctx = await setup();
      const addr = await ctx.rewarder.erc721();
      expect(addr).to.eq(ctx.token);
    });
  });

  describe("incrementBalance", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.rewarder.connect(ctx.w1).incrementBalance(100);
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
        tx = await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      });

      it("increments the balance of the account", async () => {
        expect(await ctx.rewarder.balance()).to.eq(100);
      });

      it("emits a BalanceChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "BalanceChanged")
          .withArgs(0, 100);
      });
    });
  });

  describe("takeSnapshot", () => {
    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        ctx = await setup();

        await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
        await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 2);
        await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 3);
        await ctx.token.connect(ctx.owner).mint(ctx.w2.address, 4);

        await ctx.rewarder.connect(ctx.owner).incrementBalance(1003);

        // anyone can call it.
        tx = await ctx.rewarder.connect(ctx.w1).takeSnapshot();
      });

      it("emits a SnapshotCreated event", async () => {
        await expect(tx).to.emit(ctx.rewarder, "SnapshotCreated");
      });

      it("sets the block number to the tx block", async () => {
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.blockNumber).to.eq(tx.blockNumber);
      });

      it("sets the block timestamp to the tx timestamp", async () => {
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.blockTimestamp).to.eq(await time.latest());
      });

      it("sets the supply to the total supply of the token", async () => {
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.supply).to.eq(4); // 4 tokens minted
      });

      it("sets the reward to the balance divided by the total supply", async () => {
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.reward).to.eq(1000 / 4); // integer division of 1003 / 4
      });

      it("sets the unclaimed value to the balance minus the reminder of the division", async () => {
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.unclaimed).to.eq(1000);
      });

      it("updates the balance with the reminder of the division", async () => {
        const balance = await ctx.rewarder.balance();
        expect(balance).to.eq(3); // 1003 % 4
      });

      it("emits a BalanceChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "BalanceChanged")
          .withArgs(1003, 3);
      });

      it("sets a balance for the token", async () => {
        const balance = await ctx.rewarder.balanceOf(1);
        expect(balance).to.eq(250); // integer division of 1003 / 4
      });

      describe("after the snapshot interval has passed", () => {
        let unclaimed: bigint;
        let balance: bigint;

        beforeEach(async () => {
          await time.increase(ctx.minSnapshotInterval);
          unclaimed = (await ctx.rewarder.lastSnapshot()).unclaimed;
          balance = await ctx.rewarder.balance();
        });

        it("creates another snapshot", async () => {
          await ctx.rewarder.connect(ctx.owner).takeSnapshot();
        });

        it("adds the unclaimed amount to the new available reward", async () => {
          const snapshot = await ctx.rewarder.lastSnapshot();
          expect(snapshot.reward * snapshot.supply).to.eq(
            balance + unclaimed - 3n
          ); // 3 is the reminder of the previous division
        });
      });
    });

    it("reverts when the snapshot interval has not passed", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      await ctx.rewarder.connect(ctx.owner).takeSnapshot();
      const op = ctx.rewarder.connect(ctx.owner).takeSnapshot();
      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "SnapshotTooEarly"
      );
    });
  });

  describe("issueReward", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.rewarder.connect(ctx.w1).issueReward(ctx.w2.address, 1);
      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts when the token is not owned by the account", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      const op = ctx.rewarder.connect(ctx.owner).issueReward(ctx.w2.address, 1);
      await expect(op)
        .to.be.revertedWithCustomError(ctx.rewarder, "ERC721NotOwned")
        .withArgs(ctx.w2.address, ctx.token, 1);
    });

    it("reverts when the token has been already claimed", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      await ctx.rewarder.connect(ctx.owner).takeSnapshot();
      await ctx.rewarder.connect(ctx.owner).issueReward(ctx.w1.address, 1);
      const op = ctx.rewarder.connect(ctx.owner).issueReward(ctx.w1.address, 1);
      await expect(op)
        .to.be.revertedWithCustomError(ctx.rewarder, "ERC721AlreadyClaimed")
        .withArgs(ctx.w1.address, ctx.token, 1);
    });

    it("reverts when the token was minted after the snapshot", async () => {
      const ctx = await setup();
      // we need one token to be able to create the first snapshot
      const BEFORE_TOKEN = 1;
      const AFTER_TOKEN = 2;
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, BEFORE_TOKEN);
      await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      const snapshotTx = await ctx.rewarder.connect(ctx.owner).takeSnapshot();
      // now we can mint a new token and try to claim it
      const mintTx = await ctx.token
        .connect(ctx.owner)
        .mint(ctx.w1.address, AFTER_TOKEN);
      const op = ctx.rewarder
        .connect(ctx.owner)
        .issueReward(ctx.w1.address, AFTER_TOKEN);

      await expect(op)
        .to.be.revertedWithCustomError(ctx.rewarder, "ERC721NotInSnapshot")
        .withArgs(
          ctx.w1.address,
          ctx.token,
          AFTER_TOKEN,
          mintTx.blockNumber,
          snapshotTx.blockNumber
        );
    });

    describe("success", () => {
      let ctx: Context;
      let beforeSnapshot: IERC721BasedRewarder.SnapshotStruct;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        ctx = await setup();
        await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
        await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
        await ctx.rewarder.connect(ctx.owner).takeSnapshot();

        beforeSnapshot = await ctx.rewarder.lastSnapshot();

        tx = await ctx.rewarder
          .connect(ctx.owner)
          .issueReward(ctx.w1.address, 1);
      });

      it("decrements the unclaimed amount by the reward amount", async () => {
        const newUnclaimed =
          BigInt(beforeSnapshot.unclaimed) - BigInt(beforeSnapshot.reward);
        const snapshot = await ctx.rewarder.lastSnapshot();
        expect(snapshot.unclaimed).to.eq(newUnclaimed);
      });

      it("emits a RewardClaimed event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "RewardClaimed")
          .withArgs(ctx.w1.address, ctx.token, 1, beforeSnapshot.reward);
      });
    });
  });

  describe("balanceOf", () => {
    it("returns zero if the token was minted after the snapshot", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      await ctx.rewarder.connect(ctx.owner).takeSnapshot();

      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 2);
      const balance = await ctx.rewarder.balanceOf(2);
      expect(balance).to.eq(0);
    });

    it("returns zero if the token was already claimed", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      await ctx.rewarder.connect(ctx.owner).takeSnapshot();
      await ctx.rewarder.connect(ctx.owner).issueReward(ctx.w1.address, 1);

      const balance = await ctx.rewarder.balanceOf(1);
      expect(balance).to.eq(0);
    });

    it("returns zero if the token does not exist", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1.address, 1);
      await ctx.rewarder.connect(ctx.owner).incrementBalance(100);
      await ctx.rewarder.connect(ctx.owner).takeSnapshot();

      const balance = await ctx.rewarder.balanceOf(10000);
      expect(balance).to.eq(0);
    });
  });
});
