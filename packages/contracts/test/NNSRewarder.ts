import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3, w4, w5, protocol] = await ethers.getSigners();

  const erc20F = await ethers.getContractFactory("ERC20Mock");
  const erc20 = await erc20F.deploy();

  const swapRouterF = await ethers.getContractFactory("SwapRouterMock");
  const swapRouter = await swapRouterF.deploy(erc20);

  const snapshotInterval = 10234;

  const rewarderF = await ethers.getContractFactory("NNSRewarder");
  const rewarder = await rewarderF.deploy(
    swapRouter,
    erc20,
    erc20,
    protocol,
    snapshotInterval
  );

  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cldA = await cldFact.deploy("a", "a", owner, owner);
  const cldB = await cldFact.deploy("b", "b", owner, owner);
  const cldC = await cldFact.deploy("c", "c", owner, owner);
  const cldD = await cldFact.deploy("d", "d", owner, owner);

  await erc20.mint(swapRouter, 1e9);

  return {
    rewarder,
    swapRouter,
    erc20,
    cldA,
    cldAId: namehash("a"),
    cldB,
    cldBId: namehash("b"),
    cldC,
    cldCId: namehash("c"),
    cldD,
    cldDId: namehash("d"),
    owner,
    w1,
    w2,
    w3,
    w4,
    w5,
    protocol,
    snapshotInterval,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("NNSRewarder", () => {
  describe("PROTOCOL_SHARE", async () => {
    it("should be 5%", async () => {
      const ctx = await setup();
      expect(await ctx.rewarder.PROTOCOL_SHARE()).to.eq(5);
    });
  });

  describe("registerCld", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.w1)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, true);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts when the sum of shares are above 100", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.owner)
        .registerCld(ctx.cldA, ctx.w2, 70, 29, true); // 70 + 29 + 5 = 104
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "InvalidShares"
      );
    });

    it("reverts when registering twice", async () => {
      const ctx = await setup();
      await ctx.rewarder
        .connect(ctx.owner)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, true);

      const tx = ctx.rewarder
        .connect(ctx.owner)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, true);
      await expect(tx)
        .to.revertedWithCustomError(ctx.rewarder, "CldAlreadyRegistered")
        .withArgs(ctx.cldAId);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let payout: string;
      const referralShare = 13;
      const communityShare = 54;
      const ecosystemShare = (100 - 5 - communityShare - referralShare) / 2;

      it("does not revery", async () => {
        ctx = await setup();
        payout = ctx.w5.address;

        tx = await ctx.rewarder
          .connect(ctx.owner)
          .registerCld(ctx.cldA, payout, referralShare, communityShare, true);
      });

      it("emits a CldRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "CldRegistered")
          .withArgs(
            ctx.cldAId,
            payout,
            referralShare,
            communityShare,
            ecosystemShare
          );
      });

      it("configurationOf returns the expected values", async () => {
        const cfg = await ctx.rewarder.configurationOf(ctx.cldAId);
        expect(cfg.referralShare).to.eq(referralShare);
        expect(cfg.communityShare).to.eq(communityShare);
        expect(cfg.ecosystemShare).to.eq(ecosystemShare);
        expect(cfg.protocolShare).to.eq(5);
        expect(cfg.isCldSplitRewards).to.eq(true);
        expect(cfg.payoutTarget).to.eq(payout);
        expect(cfg.registry).to.eq(ctx.cldA);
      });
    });
  });

  describe("collect", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.w1)
        .collect(ctx.cldAId, ethers.ZeroAddress);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts when the cld is not registered", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.owner)
        .collect(ctx.cldAId, ethers.ZeroAddress);
      await expect(tx)
        .to.revertedWithCustomError(ctx.rewarder, "InvalidCld")
        .withArgs(ctx.cldAId);
    });

    describe("success with referer", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let communityPayout: string;
      let referer: string;
      const referralShare = 13;
      const communityShare = 54;
      const ecosystemShare = (100 - 5 - communityShare - referralShare) / 2;
      const valueETH = 203947;
      const valueERC20 = valueETH * 2; // the mock swap router will return 2x the value

      it("does not revert", async () => {
        ctx = await setup();
        communityPayout = ctx.w5.address;
        referer = ctx.w4.address;

        await ctx.rewarder
          .connect(ctx.owner)
          .registerCld(
            ctx.cldA,
            communityPayout,
            referralShare,
            communityShare,
            true
          );
        await ctx.cldA.register(ctx.w1, "hey1", [], [], 0, false);
        await ctx.cldA.register(ctx.w2, "hey2", [], [], 0, false);
        await ctx.cldA.register(ctx.w3, "hey3", [], [], 0, false);

        await ctx.cldB.register(ctx.w1, "b1", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b2", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b3", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b4", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b5", [], [], 0, false);

        await ctx.rewarder
          .connect(ctx.owner)
          .registerCld(
            ctx.cldB,
            communityPayout,
            referralShare,
            communityShare,
            false
          );

        await ctx.erc20.mint(ctx.swapRouter, 1e9);

        tx = await ctx.rewarder
          .connect(ctx.owner)
          .collect(ctx.cldBId, referer, { value: valueETH });
      });

      it("emits a CldCollected event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(ctx.cldBId, referer, valueETH, valueERC20);
      });

      describe("referer", () => {
        const expBalance = Math.floor((referralShare * valueERC20) / 100);

        it("assigns balance", async () => {
          const balance = await ctx.rewarder["balanceOf(address)"](referer);
          expect(balance).to.eq(expBalance);
        });

        it("emits BalanceChanged event", async () => {
          await expect(tx)
            .to.emit(ctx.rewarder, "BalanceChanged")
            .withArgs(referer, expBalance, expBalance);
        });
      });

      describe("community", () => {
        const expBalance = Math.floor((communityShare * valueERC20) / 100);

        it("assigns balance", async () => {
          const balance = await ctx.rewarder["balanceOf(address)"](
            communityPayout
          );
          expect(balance).to.eq(expBalance);
        });

        it("emits BalanceChanged event", async () => {
          await expect(tx)
            .to.emit(ctx.rewarder, "BalanceChanged")
            .withArgs(communityPayout, expBalance, expBalance);
        });
      });

      describe("protocol", () => {
        const expBalance = Math.floor((5 * valueERC20) / 100);

        it("assigns balance", async () => {
          const balance = await ctx.rewarder["balanceOf(address)"](
            ctx.protocol
          );
          expect(balance).to.eq(expBalance);
        });

        it("emits BalanceChanged event", async () => {
          await expect(tx)
            .to.emit(ctx.rewarder, "BalanceChanged")
            .withArgs(ctx.protocol, expBalance, expBalance);
        });
      });

      // TODO: ecosystem

      describe("holders", () => {
        function s(share: number) {
          return Math.floor((share * valueERC20) / 100);
        }

        const expBalance =
          valueERC20 -
          s(5) -
          s(ecosystemShare) -
          s(referralShare) -
          s(communityShare);

        it("has a positive balance", async () => {
          expect(expBalance).to.be.greaterThanOrEqual(0);
        });

        it("assigns balance", async () => {
          const balance = await ctx.rewarder.balanceOfHolders();
          expect(balance).to.eq(expBalance);
        });

        it("emits HoldersBalanceChanged event", async () => {
          await expect(tx)
            .to.emit(ctx.rewarder, "HoldersBalanceChanged")
            .withArgs(expBalance, expBalance);
        });
      });
    });
  });

  describe("Holders Snapshot", () => {
    let ctx: Context;
    let tx: ContractTransactionResponse;
    let txTimestamp: number;
    let usersBalance: number;

    before(async () => {
      ctx = await setup();

      await ctx.rewarder
        .connect(ctx.owner)
        .registerCld(ctx.cldA, ethers.ZeroAddress, 10, 50, true);
      await ctx.cldA.register(ctx.w1, "d1", [], [], 0, true);
      await ctx.cldA.register(ctx.w2, "d2", [], [], 0, true);
      await ctx.cldA.register(ctx.w3, "d3", [], [], 0, true);
      await ctx.cldA.register(ctx.w4, "d4", [], [], 0, true);
      await ctx.cldA.register(ctx.w5, "d5", [], [], 0, true);

      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2389475,
      });
      usersBalance = Number(await ctx.rewarder.balanceOfHolders());
    });

    it("has zero balance before snapshots are taken", async () => {
      const b = await ctx.rewarder["balanceOf(uint256)"](namehash("d1.a"));
      expect(b).to.eq(0);
    });

    it("creates a snapshot", async () => {
      tx = await ctx.rewarder.connect(ctx.owner).takeHolderRewardsSnapshot();
      txTimestamp = await time.latest();
    });

    it("distributes the balance and keeps the reminder", async () => {
      const snapshot = await ctx.rewarder.holderRewardsSnapshot();
      expect(snapshot.supply).to.eq(5); // 5 domains were minted
      const expReward = Math.floor(usersBalance / Number(snapshot.supply));
      expect(snapshot.reward).to.eq(expReward);
      expect(snapshot.unclaimed).to.eq(usersBalance);
      expect(snapshot.blockNumber).to.eq(tx.blockNumber);
      expect(snapshot.blockTimestamp).to.eq(txTimestamp);

      const reminder = usersBalance % Number(snapshot.supply);
      expect(await ctx.rewarder.balanceOfHolders()).to.eq(reminder);

      const b = await ctx.rewarder["balanceOf(uint256)"](namehash("d1.a"));
      expect(b).to.eq(expReward);
    });

    it("emits a HolderRewardsSnapshotCreated event", async () => {
      await expect(tx).to.emit(ctx.rewarder, "HolderRewardsSnapshotCreated");
    });

    it("reverts when snapshotting before the next is allowed", async () => {
      const tx = ctx.rewarder.takeHolderRewardsSnapshot();
      expect(tx).to.be.revertedWithCustomError(
        ctx.rewarder,
        "HoldersSnapshotTooEarly"
      );
    });

    it("redistributes the unclaimed amount in the next snapshot", async () => {
      const { unclaimed } = await ctx.rewarder.holderRewardsSnapshot();
      const value = 66666;
      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value,
      });
      await time.increase(ctx.snapshotInterval + 10);
      const b = await ctx.rewarder.balanceOfHolders();

      await ctx.rewarder.takeHolderRewardsSnapshot();

      const snapshot = await ctx.rewarder.holderRewardsSnapshot();
      expect(snapshot.unclaimed).to.eq(b + unclaimed);
    });
  });

  describe("withdraw", () => {
    it("reverts when the target is the zero address", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder.withdraw(ethers.ZeroAddress, []);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.rewarder,
        "InvalidAccount"
      );
    });

    it("transfers the balance accumulated for that wallet", async () => {
      const ctx = await setup();
      await ctx.rewarder.registerCld(
        ctx.cldA,
        ethers.ZeroAddress,
        10,
        10,
        true
      );
      const target = ctx.w5;
      await ctx.rewarder.collect(ctx.cldAId, target, {
        value: 2345,
      });

      const expBalance = await ctx.rewarder["balanceOf(address)"](
        target.address
      );
      await ctx.rewarder.withdraw(target.address, []);
      const b = await ctx.erc20.balanceOf(target.address);
      expect(b).to.be.greaterThan(0);
      expect(b).to.eq(expBalance);

      const newBalance = await ctx.rewarder["balanceOf(address)"](
        target.address
      );
      expect(newBalance).to.eq(0);
    });

    it("reverts when the tokenId is not owned by the target account", async () => {
      const ctx = await setup();
      await ctx.rewarder.registerCld(
        ctx.cldA,
        ethers.ZeroAddress,
        10,
        10,
        true
      );
      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2345,
      });

      const target = ctx.w5;
      const tokenId = namehash("hello.a");
      await ctx.cldA.register(target, "hello", [], [], 0, true);
      await ctx.rewarder.takeHolderRewardsSnapshot();

      const tx = ctx.rewarder.withdraw(ctx.w2, [tokenId]);
      await expect(tx)
        .to.be.revertedWithCustomError(ctx.rewarder, "TokenNotOwned")
        .withArgs(ctx.w2.address, ctx.cldAId, ctx.cldA, tokenId);
    });

    it("reverts when the tokenId was minted after the snapshot was taken", async () => {
      const ctx = await setup();
      await ctx.cldA.register(ctx.w1, "xxxx.a", [], [], 0, true);
      await ctx.rewarder.registerCld(
        ctx.cldA,
        ethers.ZeroAddress,
        10,
        10,
        true
      );

      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2345,
      });
      await ctx.rewarder.takeHolderRewardsSnapshot();
      const snapshotBlock = await time.latestBlock();

      const target = ctx.w5;
      const tokenId = namehash("hello.a");
      await ctx.cldA.register(target, "hello", [], [], 0, true);
      const mintBlock = await time.latestBlock();

      const tx = ctx.rewarder.withdraw(target, [tokenId]);
      await expect(tx)
        .to.be.revertedWithCustomError(ctx.rewarder, "TokenNotInSnapshot")
        .withArgs(tokenId, mintBlock, snapshotBlock);
    });

    it("transfers the balance to the owner", async () => {
      const ctx = await setup();
      await ctx.cldA.register(ctx.w1, "xxxx.a", [], [], 0, true);
      await ctx.rewarder.registerCld(
        ctx.cldA,
        ethers.ZeroAddress,
        10,
        10,
        true
      );

      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2345,
      });
      const target = ctx.w5;
      const tokenId = namehash("hello.a");
      await ctx.cldA.register(target, "hello", [], [], 0, true);
      await ctx.rewarder.takeHolderRewardsSnapshot();
      const snapshot = await ctx.rewarder.holderRewardsSnapshot();

      const tx = await ctx.rewarder.withdraw(target, [tokenId]);

      const b = await ctx.erc20.balanceOf(target.address);
      expect(b).to.be.eq(snapshot.reward);
      expect(b).to.be.greaterThan(0);

      const tb = await ctx.rewarder["balanceOf(uint256)"](tokenId);
      expect(tb).to.eq(0);

      await expect(tx)
        .to.emit(ctx.rewarder, "Withdrawn")
        .withArgs(target, [tokenId], snapshot.reward);
    });

    it("doesn't transfer the balance twice", async () => {
      const ctx = await setup();
      await ctx.cldA.register(ctx.w1, "xxxx.a", [], [], 0, true);
      await ctx.rewarder.registerCld(
        ctx.cldA,
        ethers.ZeroAddress,
        10,
        10,
        true
      );

      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2345,
      });
      const target = ctx.w5;
      const tokenId = namehash("hello.a");
      await ctx.cldA.register(target, "hello", [], [], 0, true);
      await ctx.rewarder.takeHolderRewardsSnapshot();

      await ctx.rewarder.withdraw(target, [tokenId]);

      const tx = ctx.rewarder.withdraw(target, [tokenId]);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.rewarder,
        "NothingToWithdraw"
      );
    });

    it("withdraws all token and balance", async () => {
      const ctx = await setup();
      // Target is going to be the community reward.
      const target = ctx.w5;

      // only CLD A counts
      await ctx.rewarder.registerCld(ctx.cldA, target, 10, 10, true);
      await ctx.rewarder.registerCld(ctx.cldB, ctx.w1, 10, 10, false);
      await ctx.rewarder.registerCld(ctx.cldC, ctx.w1, 10, 10, false);

      await ctx.cldA.register(target, "claim1", [], [], 0, true);
      await ctx.cldA.register(target, "claim2", [], [], 0, true);
      await ctx.cldA.register(target, "claim3", [], [], 0, true);
      await ctx.cldA.register(target, "claim4", [], [], 0, true);
      await ctx.cldA.register(ctx.w2, "xas2", [], [], 0, false);
      await ctx.cldA.register(ctx.w3, "xas3", [], [], 0, false);
      await ctx.cldB.register(ctx.w1, "hey1", [], [], 0, true);
      await ctx.cldC.register(ctx.w2, "hey2", [], [], 0, true);
      await ctx.cldC.register(target, "claim1", [], [], 0, true);
      await ctx.cldC.register(target, "claim2", [], [], 0, true);

      await ctx.rewarder.collect(ctx.cldAId, ethers.ZeroAddress, {
        value: 2345,
      });
      await ctx.rewarder.collect(ctx.cldBId, ethers.ZeroAddress, {
        value: 3432,
      });
      await ctx.rewarder.takeHolderRewardsSnapshot();
      const snapshot = await ctx.rewarder.holderRewardsSnapshot();

      const expAddrBalance = await ctx.rewarder["balanceOf(address)"](
        target.address
      );
      const expTokenBalance = 4n * snapshot.reward;

      await ctx.rewarder.withdraw(target, [
        namehash("claim1.a"),
        namehash("claim2.a"),
        namehash("claim3.a"),
        namehash("claim4.a"),
      ]);

      const b = await ctx.erc20.balanceOf(target.address);
      expect(b).to.eq(expAddrBalance + expTokenBalance);
    });
  });
});
