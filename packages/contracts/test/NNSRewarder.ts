import { expect } from "chai";
import {
  AddressLike,
  BigNumberish,
  ContractTransactionResponse,
  namehash,
} from "ethers";
import { ethers } from "hardhat";
import { AccountRewarder, ERC721BasedRewarder } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function setup() {
  const [owner, w1, w2, w3, w4, w5, controller, protocol] =
    await ethers.getSigners();

  const erc20F = await ethers.getContractFactory("ERC20Mock");
  const erc20 = await erc20F.deploy();

  const swapRouterF = await ethers.getContractFactory("SwapRouterMock");
  const swapRouter = await swapRouterF.deploy(erc20);

  const rewarderF = await ethers.getContractFactory("NNSRewarder");
  const rewarder = await rewarderF.deploy();
  await rewarder.initialize(swapRouter, erc20, erc20, protocol);

  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cldA = await cldFact.deploy("a", owner, owner);
  const cldB = await cldFact.deploy("b", owner, owner);
  const cldC = await cldFact.deploy("c", owner, owner);
  const cldD = await cldFact.deploy("d", owner, owner);

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
  const ecosystemRewarder = await tokenRewarderF.deploy(
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
  await erc20.mint(rewarder, 1e9);

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
    newERC721Rewarder: (token: AddressLike) =>
      tokenRewarderF.deploy(token, snapshotInterval),
    newAccountRewarder: () => accountRewarderF.deploy(),
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
    it("reverts when not called by the controller", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.w1)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, 10);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "CallerNotController"
      );
    });

    it("reverts when the sum of shares are above 100", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 70, 29, 2); // 70 + 29 + 2 + 5 = 106
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "InvalidShares"
      );
    });

    it("reverts when registering twice", async () => {
      const ctx = await setup();
      await ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, 10);

      const tx = ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w2, 10, 10, 10);
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
      const ecosystemShare = 27;

      it("does not revert", async () => {
        ctx = await setup();
        payout = ctx.w5.address;

        tx = await ctx.rewarder
          .connect(ctx.controller)
          .registerCld(
            ctx.cldA,
            payout,
            referralShare,
            communityShare,
            ecosystemShare
          );
      });

      it("emits a CldRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "CldRegistered")
          .withArgs(ctx.cldAId);
      });

      it("emits a CldConfigurationChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "CldConfigurationChanged")
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

    describe("success with referer holding a holder token", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let communityPayout: string;
      let referer: string;
      const referralShare = 13;
      const communityShare = 54;
      const ecosystemShare = 27;
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
            communityShare,
            ecosystemShare
          );
        await ctx.cldA.register(ctx.w1, "hey1", [], [], 0, false);
        await ctx.cldA.register(ctx.w2, "hey2", [], [], 0, false);
        await ctx.cldA.register(ctx.w3, "hey3", [], [], 0, false);

        await ctx.cldB.register(ctx.w1, "b1", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b2", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b3", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b4", [], [], 0, false);
        await ctx.cldB.register(ctx.w2, "b5", [], [], 0, false);

        await ctx.holdersToken.mint(referer, 99);

        await ctx.rewarder
          .connect(ctx.controller)
          .registerCld(
            ctx.cldB,
            communityPayout,
            referralShare,
            communityShare,
            ecosystemShare
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

    describe("success without referer", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let communityPayout: string;
      const referralShare = 13;
      const communityShare = 54;
      const ecosystemShare = 27;
      const valueETH = 203947;
      const valueERC20 = valueETH * 2; // the mock swap router will return 2x the value

      beforeEach(async () => {
        ctx = await setup();
        communityPayout = ctx.w5.address;

        await ctx.rewarder
          .connect(ctx.controller)
          .registerCld(
            ctx.cldA,
            communityPayout,
            referralShare,
            communityShare,
            ecosystemShare
          );

        await ctx.erc20.mint(ctx.swapRouter, 1e9);

        tx = await ctx.rewarder
          .connect(ctx.controller)
          .collect(ctx.cldAId, ethers.ZeroAddress, { value: valueETH });
      });

      it("assigns the referer balance to the community", async () => {
        const expShare = communityShare + referralShare;
        const expBalance = Math.floor((expShare * valueERC20) / 100);
        const balance = await ctx.accountRewarder.balanceOf(communityPayout);
        expect(balance).to.eq(expBalance);
      });

      it("emits a Collected event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(ctx.cldAId, ethers.ZeroAddress, valueETH, valueERC20);
      });
    });

    describe("success with referer not holding a holder token", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let communityPayout: string;
      let referer: string;
      const referralShare = 13;
      const communityShare = 54;
      const ecosystemShare = 27;
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
            communityShare,
            ecosystemShare
          );

        await ctx.erc20.mint(ctx.swapRouter, 1e9);

        tx = await ctx.rewarder
          .connect(ctx.controller)
          .collect(ctx.cldAId, referer, { value: valueETH });
      });

      it("assigns the referer balance to the community", async () => {
        const expShare = communityShare + referralShare;
        const expBalance = Math.floor((expShare * valueERC20) / 100);
        const balance = await ctx.accountRewarder.balanceOf(communityPayout);
        expect(balance).to.eq(expBalance);
      });

      it("emits a Collected event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(ctx.cldAId, referer, valueETH, valueERC20);
      });
    });

    describe("success with no holder rewards", () => {
      let ctx: Context;

      beforeEach(async () => {
        ctx = await setup();
        await ctx.rewarder.connect(ctx.controller).registerCld(
          ctx.cldA,
          ctx.w5.address,
          35, // referral
          10, // community
          50 // ecosystem
        );
        // sum is 95 + protocol (5) = 100

        await ctx.erc20.mint(ctx.swapRouter, 1e9);

        await ctx.rewarder
          .connect(ctx.controller)
          .collect(ctx.cldAId, ctx.w4.address, { value: 100000 });
      });

      it("assigns zero balance to the holders", async () => {
        const balance = await ctx.holdersRewarder.balance();
        expect(balance).to.eq(0);
      });
    });
  });

  describe("controller", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder.connect(ctx.w1).setController(ctx.w2.address);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("does not revert when called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder
        .connect(ctx.owner)
        .setController(ctx.protocol.address);
      await expect(tx).not.to.be.reverted;
    });
  });

  describe("ecosystem rewarder", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder.connect(ctx.w1).setEcosystemRewarder(ctx.w5);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("does not revert when called by the owner", async () => {
      const ctx = await setup();
      await ctx.rewarder.connect(ctx.owner).setEcosystemRewarder(ctx.w5);
      const newRewader = await ctx.rewarder.ecosystemRewarder();
      expect(newRewader).to.eq(ctx.w5.address);
    });
  });

  describe("holder rewarder", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder.connect(ctx.w1).setHolderRewarder(ctx.w5);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("does not revert when called by the owner", async () => {
      const ctx = await setup();
      await ctx.rewarder.connect(ctx.owner).setHolderRewarder(ctx.w5);
      const newRewader = await ctx.rewarder.holderRewarder();
      expect(newRewader).to.eq(ctx.w5.address);
    });
  });

  describe("account rewarder", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.rewarder.connect(ctx.w1).setAccountRewarder(ctx.w5);
      await expect(tx).to.revertedWithCustomError(
        ctx.rewarder,
        "OwnableUnauthorizedAccount"
      );
    });

    it("does not revert when called by the owner", async () => {
      const ctx = await setup();
      await ctx.rewarder.connect(ctx.owner).setAccountRewarder(ctx.w5);
      const newRewader = await ctx.rewarder.accountRewarder();
      expect(newRewader).to.eq(ctx.w5.address);
    });
  });

  describe("balanceOf", () => {
    let ctx: Context;
    let ecosystemRewarder: ERC721BasedRewarder;
    let holderRewarder: ERC721BasedRewarder;
    let accountRewarder: AccountRewarder;

    before(async () => {
      ctx = await setup();
      // Holder Setup: 5 tokens and 1000 reward
      await ctx.holdersToken.mint(ctx.w1, 1);
      await ctx.holdersToken.mint(ctx.w1, 2);
      await ctx.holdersToken.mint(ctx.w1, 3);
      await ctx.holdersToken.mint(ctx.w1, 4);
      await ctx.holdersToken.mint(ctx.w2, 5);
      holderRewarder = await ctx.newERC721Rewarder(ctx.holdersToken);
      await holderRewarder.incrementBalance(1000);
      await time.increase(ctx.snapshotInterval + 10);

      await holderRewarder.takeSnapshot();
      await ctx.rewarder.setHolderRewarder(holderRewarder);
      // Ecosystem Setup: 4 tokens, 1000 reward
      await ctx.ecosystemToken.mint(ctx.w1, 61);
      await ctx.ecosystemToken.mint(ctx.w1, 62);
      await ctx.ecosystemToken.mint(ctx.w2, 63);
      await ctx.ecosystemToken.mint(ctx.w3, 64);
      ecosystemRewarder = await ctx.newERC721Rewarder(ctx.ecosystemToken);
      await ecosystemRewarder.incrementBalance(1000);
      await time.increase(ctx.snapshotInterval + 10);

      await ecosystemRewarder.takeSnapshot();
      await ctx.rewarder.setEcosystemRewarder(ecosystemRewarder);
      // Account Setup: 853 reward for w1
      accountRewarder = await ctx.newAccountRewarder();
      await accountRewarder.incrementBalanceOf(ctx.w1.address, 853);
      await ctx.rewarder.setAccountRewarder(accountRewarder);
    });

    it("returns the sum of all balances", async () => {
      const expBalance =
        (4 * 1000) / 5 + // holders
        (2 * 1000) / 4 + // ecosystem
        853; // account

      const balance = await ctx.rewarder.balanceOf(
        ctx.w1.address,
        [1, 2, 3, 4],
        [61, 62]
      );

      expect(balance).to.eq(expBalance);
    });

    it("returns 0 when there is no balance", async () => {
      const balance = await ctx.rewarder.balanceOf(
        ctx.w2.address, // w2 has no account balance
        [876],
        [987]
      );

      expect(balance).to.eq(0);
    });
  });

  describe("withdraw", () => {
    let ctx: Context;
    let ecosystemRewarder: ERC721BasedRewarder;
    let holderRewarder: ERC721BasedRewarder;
    let accountRewarder: AccountRewarder;

    beforeEach(async () => {
      ctx = await setup();
      // Holder Setup: 5 tokens and 1000 reward
      await ctx.holdersToken.mint(ctx.w1, 1);
      await ctx.holdersToken.mint(ctx.w1, 2);
      await ctx.holdersToken.mint(ctx.w1, 3);
      await ctx.holdersToken.mint(ctx.w1, 4);
      await ctx.holdersToken.mint(ctx.w2, 5);
      holderRewarder = await ctx.newERC721Rewarder(ctx.holdersToken);
      await holderRewarder.incrementBalance(1000);
      await time.increase(ctx.snapshotInterval + 10);
      await holderRewarder.takeSnapshot();
      await ctx.rewarder.setHolderRewarder(holderRewarder);
      await holderRewarder.transferOwnership(ctx.rewarder);
      // Ecosystem Setup: 4 tokens, 1000 reward
      await ctx.ecosystemToken.mint(ctx.w1, 61);
      await ctx.ecosystemToken.mint(ctx.w1, 62);
      await ctx.ecosystemToken.mint(ctx.w2, 63);
      await ctx.ecosystemToken.mint(ctx.w3, 64);
      ecosystemRewarder = await ctx.newERC721Rewarder(ctx.ecosystemToken);
      await ecosystemRewarder.incrementBalance(1000);
      await time.increase(ctx.snapshotInterval + 10);
      await ecosystemRewarder.takeSnapshot();
      await ctx.rewarder.setEcosystemRewarder(ecosystemRewarder);
      await ecosystemRewarder.transferOwnership(ctx.rewarder);
      // Account Setup: 853 reward for w1
      accountRewarder = await ctx.newAccountRewarder();
      await accountRewarder.incrementBalanceOf(ctx.w1.address, 853);
      await ctx.rewarder.setAccountRewarder(accountRewarder);
      await accountRewarder.transferOwnership(ctx.rewarder);
    });

    it("reverts when there is nothing to withdraw", async () => {
      const op = ctx.rewarder.withdraw(ctx.w5.address, [], []);
      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "NothingToWithdraw"
      );
    });

    it("reverts when the account is not the owner of a given holder token", async () => {
      const op = ctx.rewarder.withdraw(ctx.w2.address, [1], []);
      await expect(op).to.be.revertedWithCustomError(
        holderRewarder,
        "ERC721NotOwned"
      );
    });

    it("reverts when the account is not the owner of a given ecosystem token", async () => {
      const op = ctx.rewarder.withdraw(ctx.w2.address, [], [61]);
      await expect(op).to.be.revertedWithCustomError(
        ecosystemRewarder,
        "ERC721NotOwned"
      );
    });

    it("reverts when a token was minted after the snapshot", async () => {
      await ctx.holdersToken.mint(ctx.w2, 999);

      const op = ctx.rewarder.withdraw(ctx.w2.address, [999], []);
      await expect(op).to.be.revertedWithCustomError(
        ecosystemRewarder,
        "ERC721NotInSnapshot"
      );
    });

    describe("success", () => {
      const holderTokenIds = [1, 2, 3, 4];
      const ecosystemTokenIds = [61, 62];
      let tx: ContractTransactionResponse;
      let expBalance: BigNumberish;
      let account: string;

      beforeEach(async () => {
        account = ctx.w1.address;
        expBalance = await ctx.rewarder.balanceOf(
          account,
          holderTokenIds,
          ecosystemTokenIds
        );
        tx = await ctx.rewarder.withdraw(
          account,
          holderTokenIds,
          ecosystemTokenIds
        );
      });

      it("tranfers the expected amount to the account", async () => {
        const b = await ctx.erc20.balanceOf(account);
        expect(b).to.eq(expBalance);
      });

      it("emits a Withdrawn event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Withdrawn")
          .withArgs(account, holderTokenIds, ecosystemTokenIds, expBalance);
      });

      it("emits a RewardClaimed event for each holder token", async () => {
        for (const tokenId of holderTokenIds) {
          await expect(tx)
            .to.emit(holderRewarder, "RewardClaimed")
            .withArgs(account, ctx.holdersToken, tokenId, 1000 / 5); // amount / supply
        }
      });

      it("emits a RewardClaimed event for each ecosystem token", async () => {
        for (const tokenId of ecosystemTokenIds) {
          await expect(tx)
            .to.emit(ecosystemRewarder, "RewardClaimed")
            .withArgs(account, ctx.ecosystemToken, tokenId, 1000 / 4); // amount / supply
        }
      });

      it("emits a RewardClaimed event for account", async () => {
        for (const _token of ecosystemTokenIds) {
          await expect(tx)
            .to.emit(accountRewarder, "RewardClaimed")
            .withArgs(account, 853);
        }
      });
    });
  });

  describe("setCldConfiguration", () => {
    let ctx: Context;

    beforeEach(async () => {
      ctx = await setup();
      await ctx.rewarder
        .connect(ctx.controller)
        .registerCld(ctx.cldA, ctx.w5.address, 6, 7, 3);
    });

    it("reverts when not called by the community manager", async () => {
      const op = ctx.rewarder
        .connect(ctx.w1)
        .setCldConfiguration(ctx.cldAId, ctx.w3, 10, 10, 10);
      await expect(op)
        .to.be.revertedWithCustomError(
          ctx.rewarder,
          "CallerNotCommunityManager"
        )
        .withArgs(ctx.cldAId, ctx.w1);
    });

    it("reverts when the cld is not registered", async () => {
      const op = ctx.rewarder
        .connect(ctx.w1)
        .setCldConfiguration(ctx.cldDId, ctx.w3, 10, 10, 10);
      await expect(op)
        .to.be.revertedWithCustomError(ctx.rewarder, "InvalidCld")
        .withArgs(ctx.cldDId);
    });

    it("reverts when the shares are invalid", async () => {
      await ctx.cldA.transferCommunityRole(ctx.w1);

      const op = ctx.rewarder
        .connect(ctx.w1)
        .setCldConfiguration(ctx.cldAId, ctx.w3, 70, 20, 14);

      await expect(op).to.be.revertedWithCustomError(
        ctx.rewarder,
        "InvalidShares"
      );
    });

    describe("success", () => {
      let commManager: HardhatEthersSigner;
      let payoutTarget: string;
      const referralShare = 21;
      const communityShare = 22;
      const ecosystemShare = 23;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        commManager = ctx.w5;
        payoutTarget = ctx.w4.address;
        await ctx.cldA.transferCommunityRole(commManager);

        tx = await ctx.rewarder
          .connect(commManager)
          .setCldConfiguration(
            ctx.cldAId,
            payoutTarget,
            referralShare,
            communityShare,
            ecosystemShare
          );
      });

      it("updates the cld configuration", async () => {
        const cfg = await ctx.rewarder.configurationOf(ctx.cldAId);
        expect(cfg.referralShare).to.eq(referralShare);
        expect(cfg.communityShare).to.eq(communityShare);
        expect(cfg.ecosystemShare).to.eq(ecosystemShare);
        expect(cfg.protocolShare).to.eq(5);
        expect(cfg.payoutTarget).to.eq(payoutTarget);
        expect(cfg.registry).to.eq(ctx.cldA);
      });

      it("emits a CldConfigurationChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "CldConfigurationChanged")
          .withArgs(
            ctx.cldAId,
            payoutTarget,
            referralShare,
            communityShare,
            ecosystemShare
          );
      });
    });
  });
});
