import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [deployer, w1, w2, w3, minter, community] = await ethers.getSigners();

  const name = "noggles";
  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cld = await cldFact.deploy(name, `${name}-SYMBOL`, minter, community);

  return {
    deployer,
    w1,
    w2,
    w3,
    minter,
    community,
    cld,
    name,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("CLDRegistry", () => {
  describe("cld", () => {
    it("returns the namehash of the name and the name", async () => {
      const ctx = await setup();
      const { name, id } = await ctx.cld.cld();
      expect(id).to.eq(namehash(ctx.name));
      expect(name).to.eq(ctx.name);
    });
  });

  describe("name", () => {
    it("returns the domain name", async () => {
      const ctx = await setup();
      const name = await ctx.cld.name();
      expect(name).to.eq(ctx.name);
    });
  });

  describe("symbol", () => {
    it("returns the symbol", async () => {
      const ctx = await setup();
      const symbol = await ctx.cld.symbol();
      expect(symbol).to.eq(ctx.name + "-SYMBOL");
    });
  });

  describe("register", () => {
    it("reverts when not called by the minter", async () => {
      const ctx = await setup();
      const tx = ctx.cld.connect(ctx.w1).register(ctx.w1, "xxx", 0, false);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "AccessControlUnauthorizedAccount"
      );
    });

    describe("register of a non-expiring new domain with reverse", () => {
      let tx: ContractTransactionResponse;
      const domainName = "hello";
      const tokenId = namehash(domainName);

      let ctx: Context;
      before(async () => {
        ctx = await setup();
      });

      it("does not revert", async () => {
        tx = await ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, 0, true);
      });

      it("issues a token to the given account", async () => {
        const owner = await ctx.cld.ownerOf(tokenId);
        expect(owner).to.eq(ctx.w1);
      });

      it("emits a Transfer event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "Transfer")
          .withArgs(ethers.ZeroAddress, ctx.w1, tokenId);
      });

      it("increments the totalSupply", async () => {
        const totalSupply = await ctx.cld.totalSupply();
        expect(totalSupply).to.eq(1);
      });

      it("does not set the expiry date", async () => {
        const expiry = await ctx.cld.expiryOf(tokenId);
        expect(expiry).to.eq(0);
      });

      it("is not expired", async () => {
        const expired = await ctx.cld.isExpired(tokenId);
        expect(expired).to.eq(false);
      });

      it("emits a ReverseNameChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseNameChanged")
          .withArgs(ctx.w1, tokenId);
      });

      it("emits a NameRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRegistered")
          .withArgs(tokenId, domainName, ctx.w1, 0);
      });

      it("reverts when registering the same name twice", async () => {
        const tx = ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, 0, true);

        await expect(tx).to.revertedWithCustomError(
          ctx.cld,
          "ERC721InvalidSender"
        );
      });
    });

    describe("register an expired domain", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      const domainName = "expiring";
      const tokenId = namehash(domainName);
      let registerTimestamp: number;
      let expiry: number;

      before(async () => {
        ctx = await setup();
        tx = await ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, 10, true);

        expiry = await time.increase(100);
      });

      it("ensures name is expired", async () => {
        const expired = await ctx.cld.isExpired(tokenId);
        expect(expired).to.eq(true);
      });

      it("does not revert", async () => {
        registerTimestamp = (await time.latest()) + 100;
        await time.setNextBlockTimestamp(registerTimestamp);

        tx = await ctx.cld
          .connect(ctx.minter)
          .register(ctx.w2, domainName, 80, true);
      });

      it("emits a Transfer event to zero - burn", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "Transfer")
          .withArgs(ctx.w1, ethers.ZeroAddress, tokenId);
      });

      it("emits a Transfer event to the new owner", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "Transfer")
          .withArgs(ethers.ZeroAddress, ctx.w2, tokenId);
      });

      it("does not increment the totalSupply", async () => {
        const totalSupply = await ctx.cld.totalSupply();
        expect(totalSupply).to.eq(1);
      });

      it("does change the expiry date", async () => {
        const expiry = await ctx.cld.expiryOf(tokenId);
        expect(expiry).to.eq(expiry);
      });

      it("emits a ReverseNameChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseNameChanged")
          .withArgs(ctx.w2, tokenId);
      });

      it("emits a NameRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRegistered")
          .withArgs(tokenId, domainName, ctx.w2, registerTimestamp + 80);
      });

      it("reverts when registering a non expired name", async () => {
        const tx = ctx.cld
          .connect(ctx.minter)
          .register(ctx.w2, domainName, 100, true);

        await expect(tx).to.revertedWithCustomError(
          ctx.cld,
          "ERC721InvalidSender"
        );
      });
    });
  });
});