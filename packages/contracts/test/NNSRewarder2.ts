import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3, w4, w5, controller, protocol] =
    await ethers.getSigners();

  const erc20F = await ethers.getContractFactory("ERC20Mock");
  const erc20 = await erc20F.deploy();

  const swapRouterF = await ethers.getContractFactory("SwapRouterMock");
  const swapRouter = await swapRouterF.deploy(erc20);

  const rewarderF = await ethers.getContractFactory("NNSRewarder");
  const rewarder = await rewarderF.deploy(swapRouter, erc20, erc20, protocol);

  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cldA = await cldFact.deploy("a", "a", owner, owner);
  const cldB = await cldFact.deploy("b", "b", owner, owner);
  const cldC = await cldFact.deploy("c", "c", owner, owner);
  const cldD = await cldFact.deploy("d", "d", owner, owner);

  const snapshotInterval = 10234;
  const erc721F = await ethers.getContractFactory("ERC721Mock");
  const holdersToken = await erc721F.deploy();
  const tokenRewarderF = await ethers.getContractFactory("ERC721BasedRewarder");
  const holdersRewarder = await tokenRewarderF.deploy(
    holdersToken,
    snapshotInterval
  );
  await holdersRewarder.transferOwnership(rewarder);
  await rewarder.setHolderRewarder(holdersRewarder);

  const ecosystemToken = await erc721F.deploy();
  const ecosystemRewarderF = await ethers.getContractFactory(
    "ERC721BasedRewarder"
  );
  const ecosystemRewarder = await ecosystemRewarderF.deploy(
    ecosystemToken,
    snapshotInterval
  );
  await ecosystemRewarder.transferOwnership(rewarder);
  await rewarder.setEcosystemRewarder(ecosystemRewarder);

  const accountRewarderF = await ethers.getContractFactory("AccountRewarder");
  const accountRewarder = await accountRewarderF.deploy();
  await accountRewarder.transferOwnership(rewarder);
  await rewarder.setAccountRewarder(accountRewarder);

  await rewarder.setController(controller);

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
    controller,
    protocol,
    snapshotInterval,
    holdersToken,
    holdersRewarder,
    ecosystemToken,
    ecosystemRewarder,
    accountRewarder,
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

  describe("")

  describe("registerCld", () => {
    it("reverts when not called by the controller", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.w1)
        .registerCld(ctx.cldA, ctx.w2, 10, 10);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "CallerNotController"
      );
    });

    it("reverts when the sum of shares are above 100", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 70, 29); // 70 + 29 + 5 = 104
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "InvalidShares"
      );
    });

    it("reverts when registering twice", async () => {
      const ctx = await setup();
      await ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 10, 10);

      const tx = ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 10, 10);
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

      it("does not revert", async () => {
        ctx = await setup();
        payout = ctx.w5.address;

        tx = await ctx.rewarder
          .connect(ctx.controller)
          .registerCld(ctx.cldA, payout, referralShare, communityShare);
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
        expect(cfg.payoutTarget).to.eq(payout);
        expect(cfg.registry).to.eq(ctx.cldA);
      });
    });
  });

  describe("collect", () => {
    it("reverts when not called by the controller", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.w1)
        .collect(ctx.cldAId, ethers.ZeroAddress);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "CallerNotController"
      );
    });

    it("reverts when the cld is not registered", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.controller)
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

      beforeEach(async () => {
        ctx = await setup();
        communityPayout = ctx.w5.address;
        referer = ctx.w4.address;

        await ctx.rewarder
          .connect(ctx.controller)
          .registerCld(
            ctx.cldA,
            communityPayout,
            referralShare,
            communityShare
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
          .connect(ctx.controller)
          .registerCld(
            ctx.cldB,
            communityPayout,
            referralShare,
            communityShare
          );

        await ctx.erc20.mint(ctx.swapRouter, 1e9);

        tx = await ctx.rewarder
          .connect(ctx.controller)
          .collect(ctx.cldBId, referer, { value: valueETH });
      });

      it("emits a Collected event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(ctx.cldBId, referer, valueETH, valueERC20);
      });

      it("assigns balance to the referer", async () => {
        const expBalance = Math.floor((referralShare * valueERC20) / 100);
        const balance = await ctx.accountRewarder.balanceOf(referer);
        expect(balance).to.eq(expBalance);
      });

      it("assigns balance to the community", async () => {
        const expBalance = Math.floor((communityShare * valueERC20) / 100);
        const balance = await ctx.accountRewarder.balanceOf(communityPayout);
        expect(balance).to.eq(expBalance);
      });

      it("assigns balance to the protocol", async () => {
        const expBalance = Math.floor((5 * valueERC20) / 100);
        const balance = await ctx.accountRewarder.balanceOf(ctx.protocol);
        expect(balance).to.eq(expBalance);
      });

      it("assigns balance to the holders", async () => {
        function s(share: number) {
          return Math.floor((share * valueERC20) / 100);
        }

        const expBalance =
          valueERC20 -
          s(5) -
          s(ecosystemShare) -
          s(referralShare) -
          s(communityShare);

        const balance = await ctx.holdersRewarder.balance();
        expect(balance).to.eq(expBalance);
        expect(balance).to.be.greaterThanOrEqual(0);
      });

      it("assigns balance to the ecosystem", async () => {
        const expBalance = Math.floor((ecosystemShare * valueERC20) / 100);
        const balance = await ctx.ecosystemRewarder.balance();
        expect(balance).to.eq(expBalance);
      });
    });
  });
});
