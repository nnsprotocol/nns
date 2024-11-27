import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers, network } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("NNSResolverToken");
  const token = await factory.deploy();

  return {
    token,
    owner,
    w1,
    w2,
    w3,
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("NNSResolverToken", () => {
  describe("mint", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.token.connect(ctx.w1).mint(ctx.w2, "hello");
      await expect(op).to.be.revertedWithCustomError(
        ctx.token,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      const name = "hello";

      before(async () => {
        ctx = await setup();
      });

      it("does not revert when called by the owner", async () => {
        tx = await ctx.token.connect(ctx.owner).mint(ctx.w1, name);
      });

      it("sends the token to the given address", async () => {
        const owner = await ctx.token.ownerOf(namehash(name));
        expect(owner).to.eq(ctx.w1);
      });

      it("stores the block name", async () => {
        const b = await ctx.token.mintBlockNumberOf(namehash(name));
        expect(b).to.eq(tx.blockNumber);
      });

      it("stores the token name", async () => {
        const n = await ctx.token.nameOf(namehash(name));
        expect(n).to.eq(name);
      });

      it("total supply goes up by one", async () => {
        const supply = await ctx.token.totalSupply();
        expect(supply).to.eq(1);
      });
    });
  });

  describe("burn", () => {
    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const op = ctx.token.connect(ctx.w1).burn("hello");
      await expect(op).to.be.revertedWithCustomError(
        ctx.token,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const op = ctx.token.connect(ctx.owner).burn("hello");
      await expect(op).to.be.revertedWithCustomError(
        ctx.token,
        "ERC721NonexistentToken"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      const name = "hello";

      before(async () => {
        ctx = await setup();
        await ctx.token.connect(ctx.owner).mint(ctx.w1, name);
      });

      it("does not revert when called by the owner", async () => {
        tx = await ctx.token.connect(ctx.owner).burn(name);
      });

      it("burns the token", async () => {
        const op = ctx.token.ownerOf(namehash(name));
        await expect(op).to.be.revertedWithCustomError(
          ctx.token,
          "ERC721NonexistentToken"
        );
      });

      it("clears the block name", async () => {
        const op = ctx.token.mintBlockNumberOf(namehash(name));
        await expect(op).to.be.revertedWithCustomError(
          ctx.token,
          "ERC721NonexistentToken"
        );
      });

      it("clears the token name", async () => {
        const op = ctx.token.nameOf(namehash(name));
        await expect(op).to.be.revertedWithCustomError(
          ctx.token,
          "ERC721NonexistentToken"
        );
      });

      it("total supply goes down by one", async () => {
        const supply = await ctx.token.totalSupply();
        expect(supply).to.eq(0);
      });
    });
  });

  describe("totalSupply", () => {
    it("increments with mint and decrements with burn", async () => {
      const ctx = await setup();
      // Mint 10 and check
      for (let i = 0; i < 10; i++) {
        await ctx.token.connect(ctx.owner).mint(ctx.w1, i.toString());
        const ts = await ctx.token.totalSupply();
        expect(ts).to.eq(i + 1);
      }
      // Burn all and check
      for (let i = 0; i < 10; i++) {
        await ctx.token.connect(ctx.owner).burn(i.toString());
        const ts = await ctx.token.totalSupply();
        expect(ts).to.eq(10 - i - 1);
      }
    });
  });

  describe("tokenURI", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.token.tokenURI(namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.token,
        "ERC721NonexistentToken"
      );
    });

    it("returns the expected uri", async () => {
      const ctx = await setup();
      await ctx.token.connect(ctx.owner).mint(ctx.w1, "hello");
      const tokenId = namehash("hello");
      const uri = await ctx.token.tokenURI(tokenId);

      const contract = (await ctx.token.getAddress()).toLowerCase();
      const chainId = network.config.chainId;
      const tokenIdDec = BigInt(tokenId).toString(10);

      expect(uri).to.eq(
        `https://metadata.nns.xyz/${chainId}/${contract}/${tokenIdDec}`
      );
    });
  });
});
