import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {
  BigNumberish,
  ContractTransactionResponse,
  namehash,
  ZeroAddress,
} from "ethers";
import { ethers } from "hardhat";
import { CldRegistry } from "../typechain-types";
import { signRegistrationRequest } from "./helpers";

async function setup() {
  const [owner, w1, w2, w3, w4, w5, signer] = await ethers.getSigners();

  const erc20F = await ethers.getContractFactory("ERC20Mock");
  const erc20 = await erc20F.deploy();

  const swapRouterF = await ethers.getContractFactory("SwapRouterMock");
  const swapRouter = await swapRouterF.deploy(erc20);

  const rewarderF = await ethers.getContractFactory("NNSRewarderV1");
  const rewarder = await rewarderF.deploy();
  await rewarder.initialize(swapRouter, erc20, erc20, w5);

  const erc721F = await ethers.getContractFactory("ERC721Mock");
  const erc721 = await erc721F.deploy();
  const tokenRewarderF = await ethers.getContractFactory("ERC721BasedRewarder");
  const tokenRewarder = await tokenRewarderF.deploy(erc721, 6666);
  await tokenRewarder.transferOwnership(rewarder);
  await rewarder.setEcosystemRewarder(tokenRewarder);
  await rewarder.setHolderRewarder(tokenRewarder);

  const accountRewarderF = await ethers.getContractFactory("AccountRewarder");
  const accountRewarder = await accountRewarderF.deploy();
  await accountRewarder.transferOwnership(rewarder);
  await rewarder.setAccountRewarder(accountRewarder);

  const resolverF = await ethers.getContractFactory("NNSResolver");
  const resolver = await resolverF.deploy();
  await resolver.initialize();

  const cldFF = await ethers.getContractFactory("CldFactory");
  const cldF = await cldFF.deploy();

  const controllerF = await ethers.getContractFactory("NNSControllerV1");
  const controller = await controllerF.deploy();
  await controller.initialize(rewarder, resolver, cldF, signer);
  await rewarder.setController(controller);
  await resolver.transferOwnership(controller);
  await cldF.transferOwnership(controller);

  const pricerF = await ethers.getContractFactory("ConstantPricingOracle");
  const pricer = await pricerF.deploy(10);

  return {
    rewarder,
    resolver,
    controller,
    pricer,
    erc20,
    owner,
    w1,
    w2,
    w3,
    w4,
    w5,
    signer,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("NNSController", () => {
  describe("registerCld", () => {
    it("reverts when not called by owner", async () => {
      const ctx = await setup();
      const tx = ctx.controller
        .connect(ctx.w3)
        .registerCld(
          "test",
          10,
          10,
          10,
          ctx.pricer,
          ctx.w1,
          ctx.w1,
          false,
          true
        );
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts the pricing oracle is missing", async () => {
      const ctx = await setup();
      const op = ctx.controller
        .connect(ctx.owner)
        .registerCld(
          "test",
          10,
          10,
          10,
          ethers.ZeroAddress,
          ctx.owner,
          ctx.owner,
          false,
          true
        );

      await expect(op).to.revertedWithCustomError(
        ctx.controller,
        "InvalidPricingOracle"
      );
    });

    describe("creates a new CLD", () => {
      const cldName = "test";
      const cldId = namehash(cldName);
      let registryAddress: string;
      let tx: ContractTransactionResponse;
      let ctx: Context;

      before(async () => {
        ctx = await setup();
      });

      it("does not revert", async () => {
        tx = await ctx.controller
          .connect(ctx.owner)
          .registerCld(
            cldName,
            10,
            7,
            4,
            ctx.pricer,
            ctx.w3,
            ctx.w2,
            false,
            true
          );

        registryAddress = await ctx.controller.registryOf(cldId);
      });

      it("deploys a new registry", async () => {
        const registry = await ethers.getContractAt(
          "CldRegistry",
          registryAddress
        );

        await expect(registry.name()).to.eventually.eq("NNS .test");
        await expect(registry.symbol()).to.eventually.eq(".test");
      });

      it("emits a CldRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.controller, "CldRegistered")
          .withArgs(cldId, "test", registryAddress, false);
      });

      it("emits a PriceOracleChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.controller, "PricingOracleChanged")
          .withArgs(cldId, ctx.pricer);
      });

      it("registers the cld with the rewarder", async () => {
        await expect(tx).to.emit(ctx.rewarder, "CldRegistered").withArgs(cldId);
        await expect(tx)
          .to.emit(ctx.rewarder, "CldConfigurationChanged")
          .withArgs(cldId, ctx.w3.address, 7, 10, 4);
      });

      it("registers the cld with the resolver", async () => {
        await expect(tx)
          .to.emit(ctx.resolver, "CldRegistered")
          .withArgs(cldId, registryAddress);
      });
    });

    it("reverts when registering a cld twice", async () => {
      const ctx = await setup();
      const cldName = "hello";
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          ctx.w2,
          false,
          true
        );

      const tx = ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          ctx.w2,
          false,
          true
        );

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "CldAlreadyExists"
      );
    });
  });

  describe("setPricingOracle", () => {
    const cldName = "king";
    const cldId = namehash(cldName);
    let communityManager: SignerWithAddress;
    let ctx: Context;

    async function newOracle() {
      const pricerF = await ethers.getContractFactory("ConstantPricingOracle");
      return await pricerF.deploy(10);
    }

    beforeEach(async () => {
      ctx = await setup();
      communityManager = ctx.w5;
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          communityManager,
          false,
          true
        );
    });

    it("reverts when the sender is not the community manager", async () => {
      const tx = ctx.controller
        .connect(ctx.owner)
        .setPricingOracle(cldId, await newOracle());
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "UnauthorizedAccount"
      );
    });

    it("reverts when new oracle is zero", async () => {
      const tx = ctx.controller
        .connect(communityManager)
        .setPricingOracle(cldId, ethers.ZeroAddress);
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidPricingOracle"
      );
    });

    it("reverts when the cld is invalid", async () => {
      const tx = ctx.controller
        .connect(communityManager)
        .setPricingOracle(namehash("INVALID"), await newOracle());
      await expect(tx).to.revertedWithCustomError(ctx.controller, "InvalidCld");
    });

    it("emits a PriceOracleChanged event", async () => {
      const oracleAddress = await newOracle();

      const tx = ctx.controller
        .connect(communityManager)
        .setPricingOracle(cldId, oracleAddress);

      await expect(tx)
        .to.emit(ctx.controller, "PricingOracleChanged")
        .withArgs(cldId, oracleAddress);
    });

    it("setting the same oracle twice has no impact", async () => {
      const oracleAddress = await newOracle();

      await ctx.controller
        .connect(communityManager)
        .setPricingOracle(cldId, oracleAddress);

      const tx = await ctx.controller
        .connect(communityManager)
        .setPricingOracle(cldId, oracleAddress);

      await expect(tx).not.to.emit(ctx.controller, "PricingOracleChanged");
    });
  });

  describe("register non expiring domain", () => {
    const cldName = "nouns";
    const cldId = namehash(cldName);
    const name = "apbigcod";
    const tokenId = namehash(`${name}.${cldName}`);
    let communityManager: SignerWithAddress;
    let ctx: Context;
    let registry: CldRegistry;

    beforeEach(async () => {
      ctx = await setup();
      communityManager = ctx.w5;
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          communityManager,
          false,
          true
        );

      registry = await ethers.getContractAt(
        "CldRegistry",
        await ctx.controller.registryOf(cldId)
      );
    });

    it("reverts when the labels are less than 2", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .register(ctx.w2.address, ["one"], true, ethers.ZeroAddress, 0);
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts when the labels are more than 2", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .register(
          ctx.w2.address,
          ["one", "two", "three"],
          true,
          ethers.ZeroAddress,
          0
        );
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts when the second label is empty", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .register(ctx.w2.address, ["one", ""], true, ethers.ZeroAddress, 0);
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts when the cld does not exist", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .register(
          ctx.w2.address,
          ["name", "NEW_CLD"],
          true,
          ethers.ZeroAddress,
          0
        );
      await expect(tx).to.revertedWithCustomError(ctx.controller, "InvalidCld");
    });

    it("reverts when the amount is below the asking price", async () => {
      const tx = ctx.controller.connect(ctx.w1).register(
        ctx.w2.address,
        ["name", cldName],
        true,
        ethers.ZeroAddress,
        0,
        { value: 1 } // asking price is 10
      );
      await expect(tx)
        .to.revertedWithCustomError(
          ctx.controller,
          "InsufficientTransferAmount"
        )
        .withArgs(10, 1);
    });

    it("reverts when the cld requires a registration with signature", async () => {
      await ctx.controller
        .connect(ctx.owner)
        .setCldSignatureRequired(cldId, true);

      const tx = ctx.controller
        .connect(ctx.w1)
        .register(ctx.w2.address, [name, cldName], true, ZeroAddress, 0, {
          value: 14,
        });

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidRegistrationMethod"
      );
    });

    describe("successful registration", () => {
      let tx: ContractTransactionResponse;
      let referer: string;

      beforeEach(async () => {
        referer = ctx.w4.address;
        await ctx.controller
          .connect(ctx.owner)
          .setCldSignatureRequired(cldId, false);
        tx = await ctx.controller.connect(ctx.w1).register(
          ctx.w2.address,
          [name, cldName],
          true,
          referer,
          12, // this is ignored
          { value: 14 } // asking price is 10
        );
      });

      it("transfers the payment to the rewarder via collect", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(cldId, referer, 10, 20); // the exchange rate is 2
      });

      it("overpayments are transferred back to the sender", async () => {
        // we transferred 14 but we only expect the balance to change by 10
        await expect(tx).to.changeEtherBalance(ctx.w1, -10);
      });

      describe("domain is minted", () => {
        it("is owned by the target", async () => {
          const owner = await registry.ownerOf(tokenId);
          expect(owner).to.eq(ctx.w2);
        });

        it("has the expected name", async () => {
          const registeredName = await registry.nameOf(tokenId);
          expect(registeredName).to.eq(`${name}.${cldName}`);
        });

        it("is does not expire", async () => {
          const expiry = await registry.expiryOf(tokenId);
          expect(expiry).to.eq(0);
        });

        it("has been set as reverse", async () => {
          const reverseTokenId = await registry.reverseOf(ctx.w2);
          expect(reverseTokenId).to.eq(tokenId);

          const reverseName = await registry.reverseNameOf(ctx.w2);
          expect(reverseName).to.eq(`${name}.${cldName}`);
        });
      });
    });
  });

  describe("register expiring domain", () => {
    const cldName = "nouns";
    const cldId = namehash(cldName);
    const name = "apbigcod";
    const tokenId = namehash(`${name}.${cldName}`);
    let communityManager: SignerWithAddress;
    let ctx: Context;
    let registry: CldRegistry;

    beforeEach(async () => {
      ctx = await setup();
      communityManager = ctx.w5;
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          communityManager,
          true,
          true
        );
      await ctx.controller
        .connect(ctx.owner)
        .setCldSignatureRequired(cldId, false);

      registry = await ethers.getContractAt(
        "CldRegistry",
        await ctx.controller.registryOf(cldId)
      );
    });

    it("reverts when periods is zero", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .register(
          ctx.w2.address,
          ["name", cldName],
          true,
          ethers.ZeroAddress,
          0,
          { value: 10 }
        );
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidRegistrationPeriod"
      );
    });

    it("reverts when the amount is below the asking price", async () => {
      const tx = ctx.controller.connect(ctx.w1).register(
        ctx.w2.address,
        ["name", cldName],
        true,
        ethers.ZeroAddress,
        2,
        { value: 7 } // asking price is 10*(2 years)
      );
      await expect(tx)
        .to.revertedWithCustomError(
          ctx.controller,
          "InsufficientTransferAmount"
        )
        .withArgs(20, 7);
    });

    describe("successful registration", () => {
      let tx: ContractTransactionResponse;
      let referer: string;
      let mintTimestamp: number;

      beforeEach(async () => {
        referer = ctx.w4.address;

        mintTimestamp = (await time.latest()) + 100;
        await time.setNextBlockTimestamp(mintTimestamp);

        tx = await ctx.controller.connect(ctx.w1).register(
          ctx.w2.address,
          [name, cldName],
          true,
          referer,
          3,
          { value: 34 } // asking price is 10*(3 years)
        );
      });

      it("transfers the payment to the rewarder via collect", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(cldId, referer, 30, 60); // the exchange rate is 2
      });

      it("overpayments are transferred back to the sender", async () => {
        await expect(tx).to.changeEtherBalance(ctx.w1, -30);
      });

      describe("domain is minted", () => {
        it("expires", async () => {
          const expiry = await registry.expiryOf(tokenId);
          expect(expiry).to.eq(mintTimestamp + 3 * 365 * 24 * 3600);
        });
      });
    });
  });

  describe("register with signature", () => {
    const cldName = "nouns";
    const cldId = namehash(cldName);
    const name = "apbigcod";
    const tokenId = namehash(`${name}.${cldName}`);
    let communityManager: SignerWithAddress;
    let ctx: Context;
    let registry: CldRegistry;

    beforeEach(async () => {
      ctx = await setup();
      communityManager = ctx.w5;
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          cldName,
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          communityManager,
          false,
          true
        );
      await ctx.controller
        .connect(ctx.owner)
        .setCldSignatureRequired(cldId, true);

      registry = await ethers.getContractAt(
        "CldRegistry",
        await ctx.controller.registryOf(cldId)
      );
    });

    it("reverts when the labels are invalid", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .registerWithSignature(
          ctx.w2.address,
          ["one"],
          true,
          ethers.ZeroAddress,
          0,
          666,
          345,
          9999999999,
          "0x"
        );
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts when the signature is invalid", async () => {
      const data = {
        to: ctx.w2.address,
        cldName,
        name,
        withReverse: true,
        referer: ethers.ZeroAddress,
        periods: 0,
        price: 123,
        nonce: 666,
        expiry: (await time.latest()) + 10000,
      };
      const tx = ctx.controller.connect(ctx.w1).registerWithSignature(
        data.to,
        [data.name, data.cldName],
        data.withReverse,
        data.referer,
        data.periods,
        data.nonce,
        data.price,
        data.expiry,
        await signRegistrationRequest(ctx.signer, {
          ...data,
          cldId: namehash(data.cldName),
          expiry: data.expiry - 1,
        })
      );

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "ECDSAInvalidSignature"
      );
    });

    it("reverts when signature is signed by someone else", async () => {
      const data = {
        to: ctx.w2.address,
        cldName,
        name,
        withReverse: true,
        referer: ethers.ZeroAddress,
        periods: 0,
        price: 123,
        nonce: 666,
        expiry: (await time.latest()) + 10000,
      };
      const tx = ctx.controller.connect(ctx.w1).registerWithSignature(
        data.to,
        [data.name, data.cldName],
        data.withReverse,
        data.referer,
        data.periods,
        data.price,
        data.nonce,
        data.expiry,
        await signRegistrationRequest(ctx.w1, {
          ...data,
          cldId: namehash(data.cldName),
        })
      );

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "ECDSAInvalidSignature"
      );
    });

    it("reverts when signature is expired", async () => {
      const data = {
        to: ctx.w2.address,
        cldName,
        name,
        withReverse: true,
        referer: ethers.ZeroAddress,
        periods: 0,
        price: 123,
        nonce: 666,
        expiry: (await time.latest()) - 100,
      };
      const tx = ctx.controller.connect(ctx.w1).registerWithSignature(
        data.to,
        [data.name, data.cldName],
        data.withReverse,
        data.referer,
        data.periods,
        data.price,
        data.nonce,
        data.expiry,
        await signRegistrationRequest(ctx.signer, {
          ...data,
          cldId: namehash(data.cldName),
        })
      );

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "ECDSAInvalidSignature"
      );
    });

    it("reverts when value is less than the price", async () => {
      const data = {
        to: ctx.w2.address,
        cldName,
        name,
        withReverse: true,
        referer: ethers.ZeroAddress,
        periods: 0,
        price: 123,
        nonce: 666,
        expiry: (await time.latest()) + 100,
      };
      const tx = ctx.controller.connect(ctx.w1).registerWithSignature(
        data.to,
        [data.name, data.cldName],
        data.withReverse,
        data.referer,
        data.periods,
        data.price,
        data.nonce,
        data.expiry,
        await signRegistrationRequest(ctx.signer, {
          ...data,
          cldId: namehash(data.cldName),
        }),
        {
          value: data.price - 2,
        }
      );

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InsufficientTransferAmount"
      );
    });

    describe("success", () => {
      let params: Parameters<typeof ctx.controller.registerWithSignature>;
      let tx: ContractTransactionResponse;

      beforeEach(async () => {
        const data = {
          to: ctx.w2.address,
          cldName,
          name,
          withReverse: true,
          referer: ctx.w4.address,
          periods: 0,
          price: 111,
          nonce: 666,
          expiry: (await time.latest()) + 100,
        };
        params = [
          data.to,
          [data.name, data.cldName],
          data.withReverse,
          data.referer,
          data.periods,
          data.price,
          data.nonce,
          data.expiry,
          await signRegistrationRequest(ctx.signer, {
            ...data,
            cldId: namehash(data.cldName),
          }),
          { value: 333 }, // price is 111 so we expect 222 back
        ];
        tx = await ctx.controller
          .connect(ctx.w1)
          .registerWithSignature(...params);
      });

      describe("domain is minted", () => {
        it("is owned by the target", async () => {
          const owner = await registry.ownerOf(tokenId);
          expect(owner).to.eq(ctx.w2);
        });

        it("has the expected name", async () => {
          const registeredName = await registry.nameOf(tokenId);
          expect(registeredName).to.eq(`${name}.${cldName}`);
        });

        it("is does not expire", async () => {
          const expiry = await registry.expiryOf(tokenId);
          expect(expiry).to.eq(0);
        });

        it("has been set as reverse", async () => {
          const reverseTokenId = await registry.reverseOf(ctx.w2);
          expect(reverseTokenId).to.eq(tokenId);

          const reverseName = await registry.reverseNameOf(ctx.w2);
          expect(reverseName).to.eq(`${name}.${cldName}`);
        });

        it("the correct price has been applied", async () => {
          expect(tx).to.changeEtherBalance(ctx.w1, -111);
          expect(tx).to.changeEtherBalance(ctx.controller, 111);
        });
      });

      it("refunds the difference", async () => {
        await expect(tx).to.changeEtherBalance(ctx.w1, -111);
      });

      it("reverts when using the signature twice", async () => {
        const tx = ctx.controller
          .connect(ctx.w1)
          .registerWithSignature(...params);

        await expect(tx).to.revertedWithCustomError(
          ctx.controller,
          "ECDSAInvalidSignature"
        );
      });
    });

    describe("signature not required", () => {
      it("reverts when registering with a signature", async () => {
        await ctx.controller
          .connect(ctx.owner)
          .setCldSignatureRequired(cldId, false);

        const tx = ctx.controller
          .connect(ctx.w1)
          .registerWithSignature(
            ctx.w2.address,
            [name, cldName],
            true,
            ethers.ZeroAddress,
            0,
            123,
            666,
            9999999999,
            "0x"
          );
        await expect(tx).to.revertedWithCustomError(
          ctx.controller,
          "InvalidRegistrationMethod"
        );
      });
    });
  });

  describe("renew domain", () => {
    const cldName = "nouns";
    const cldId = namehash(cldName);
    const name = "apbigcod";
    const tokenId = namehash(`${name}.${cldName}`);
    let ctx: Context;
    let registry: CldRegistry;

    beforeEach(async () => {
      ctx = await setup();
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(cldName, 10, 7, 4, ctx.pricer, ctx.w3, ctx.w5, true, true);

      registry = await ethers.getContractAt(
        "CldRegistry",
        await ctx.controller.registryOf(cldId)
      );
      await ctx.controller.register(
        ctx.w1,
        [name, cldName],
        false,
        ethers.ZeroAddress,
        1,
        { value: 100 }
      );
    });

    it("reverts one label is passed", async () => {
      const tx = ctx.controller.connect(ctx.w1).renew([name], 1, { value: 10 });
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts 3 labels are passed", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .renew([name, name, name], 1, { value: 10 });
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts the first label is empty", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .renew(["", cldId], 1, { value: 10 });
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidLabel"
      );
    });

    it("reverts the CLD has non expiring domains", async () => {
      await ctx.controller
        .connect(ctx.owner)
        .registerCld(
          "nonexp",
          10,
          7,
          4,
          ctx.pricer,
          ctx.w3,
          ctx.w5,
          false,
          false
        );

      const tx = ctx.controller
        .connect(ctx.w1)
        .renew(["name", "nonexp"], 1, { value: 10 });
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "NonExpiringCld"
      );
    });

    it("reverts when periods is zero", async () => {
      const tx = ctx.controller
        .connect(ctx.w1)
        .renew([name, cldName], 0, { value: 10 });
      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "InvalidRegistrationPeriod"
      );
    });

    it("reverts when the amount is below the asking price", async () => {
      const tx = ctx.controller.connect(ctx.w1).renew(
        [name, cldName],
        2, // 2y
        { value: 7 } // asking price is 10*(2 years)
      );
      await expect(tx)
        .to.revertedWithCustomError(
          ctx.controller,
          "InsufficientTransferAmount"
        )
        .withArgs(20, 7);
    });

    describe("successful renewal", () => {
      let tx: ContractTransactionResponse;
      let originalExpiry: bigint;

      beforeEach(async () => {
        originalExpiry = await registry.expiryOf(tokenId);
        tx = await ctx.controller.connect(ctx.w1).renew(
          [name, cldName],
          3,
          { value: 34 } // asking price is 10*(3 years)
        );
      });

      it("transfers the payment to the rewarder via collect", async () => {
        await expect(tx)
          .to.emit(ctx.rewarder, "Collected")
          .withArgs(cldId, ethers.ZeroAddress, 30, 60); // the exchange rate is 2
      });

      it("overpayments are transferred back to the sender", async () => {
        await expect(tx).to.changeEtherBalance(ctx.w1, -30);
      });

      it("extends the expiry of the domain", async () => {
        const expiry = await registry.expiryOf(tokenId);
        expect(expiry).to.eq(originalExpiry + BigInt(3 * 365 * 24 * 3600));
      });
    });
  });

  describe("isExpiringCLD", () => {
    it("reverts when the cld is invalid", async () => {
      const ctx = await setup();
      const tx = ctx.controller.isExpiringCLD(namehash("INVALID"));
      await expect(tx).to.revertedWithCustomError(ctx.controller, "InvalidCld");
    });

    it("returns true when the cld is expiring", async () => {
      const ctx = await setup();
      const expires = true;
      const name = "test";
      await ctx.controller.registerCld(
        name,
        10,
        7,
        4,
        ctx.pricer,
        ctx.w3,
        ctx.w2,
        expires,
        true
      );
      const isExpiring = await ctx.controller.isExpiringCLD(namehash(name));
      expect(isExpiring).to.be.true;
    });

    it("returns false when the cld is not expiring", async () => {
      const ctx = await setup();
      const expires = false;
      const name = "test";
      await ctx.controller.registerCld(
        name,
        10,
        7,
        4,
        ctx.pricer,
        ctx.w3,
        ctx.w2,
        expires,
        true
      );
      const isExpiring = await ctx.controller.isExpiringCLD(namehash(name));
      expect(isExpiring).to.be.false;
    });
  });

  describe("pricingOracleOf", () => {
    it("reverts when the cld is invalid", async () => {
      const ctx = await setup();
      const tx = ctx.controller.pricingOracleOf(namehash("INVALID"));
      await expect(tx).to.revertedWithCustomError(ctx.controller, "InvalidCld");
    });

    it("returns the pricing oracle when set", async () => {
      const ctx = await setup();
      const name = "test";
      await ctx.controller.registerCld(
        name,
        10,
        7,
        4,
        ctx.pricer,
        ctx.w3,
        ctx.w2,
        false,
        true
      );
      const oracle = await ctx.controller.pricingOracleOf(namehash(name));
      expect(oracle).to.eq(ctx.pricer);
    });
  });

  describe("setCldSignatureRequired", () => {
    let cldId: BigNumberish;
    let ctx: Context;

    before(async () => {
      ctx = await setup();
      await ctx.controller.registerCld(
        "cldxx",
        10,
        7,
        4,
        ctx.pricer,
        ctx.w3,
        ctx.w2,
        false,
        true
      );
      cldId = namehash("cldxx");
    });

    it("reverts when the cld is invalid", async () => {
      const tx = ctx.controller
        .connect(ctx.owner)
        .setCldSignatureRequired(namehash("INVALID"), true);
      await expect(tx).to.revertedWithCustomError(ctx.controller, "InvalidCld");
    });

    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.controller
        .connect(ctx.w1)
        .setCldSignatureRequired(cldId, true);

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("set to true", () => {
      let tx: ContractTransactionResponse;

      before(async () => {
        tx = await ctx.controller
          .connect(ctx.owner)
          .setCldSignatureRequired(cldId, true);
      });

      it("emits a CldSignatureRequiredChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.controller, "CldSignatureRequiredChanged")
          .withArgs(cldId, true);
      });

      it("isSignatureRequired returns true", async () => {
        const requiresSignature = await ctx.controller.isSignatureRequired(
          cldId
        );
        expect(requiresSignature).to.be.true;
      });
    });

    describe("set to false", () => {
      let tx: ContractTransactionResponse;

      before(async () => {
        tx = await ctx.controller
          .connect(ctx.owner)
          .setCldSignatureRequired(cldId, false);
      });

      it("emits a CldSignatureRequiredChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.controller, "CldSignatureRequiredChanged")
          .withArgs(cldId, false);
      });

      it("isSignatureRequired returns false", async () => {
        const requiresSignature = await ctx.controller.isSignatureRequired(
          cldId
        );
        expect(requiresSignature).to.be.false;
      });
    });
  });

  describe("updateSigner", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.controller.connect(ctx.w1).updateSigner(ctx.w2);

      await expect(tx).to.revertedWithCustomError(
        ctx.controller,
        "OwnableUnauthorizedAccount"
      );
    });

    it("updates the signer", async () => {
      const ctx = await setup();
      await ctx.controller.connect(ctx.owner).updateSigner(ctx.w2);
      const signer = await ctx.controller.getFunction("signer")();
      expect(signer).to.eq(ctx.w2.address);
    });
  });
});
