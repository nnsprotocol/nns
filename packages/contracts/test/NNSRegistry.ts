import { expect } from "chai";
import { namehash } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [mintingManager, w1, w2, w3] = await ethers.getSigners();

  const regFactory = await ethers.getContractFactory("NNSRegistry");
  const registry = await regFactory.deploy();

  return {
    registry,
    mintingManager,
    w1,
    w2,
    w3,
  };
}

describe("Registry", () => {
  describe("TLD", () => {
    it("mint tld", async () => {
      const ctx = await setup();
      await ctx.registry.mintTLD("doge");
      const tokenId = namehash("doge");

      const balance = await ctx.registry.balanceOf(ctx.mintingManager.address);
      expect(balance).to.eq(1);

      const owner = await ctx.registry.ownerOf(tokenId);
      expect(owner).to.eq(ctx.mintingManager.address);

      const name = await ctx.registry.nameOf(tokenId);
      expect(name).to.eq("doge");

      const reverseTokenId = await ctx.registry.reverseOf(
        ctx.mintingManager.address
      );
      expect(reverseTokenId).to.eq(0);
    });
  });

  describe("Domain", () => {
    it("mint name", async () => {
      const ctx = await setup();
      await ctx.registry.mintTLD("doge");

      await ctx.registry.mint(ctx.w2.address, ["jimmy", "doge"], true);

      await ctx.registry.mint(ctx.w1.address, ["manin", "doge"], true);
      const tokenId = namehash("manin.doge");

      const balance = await ctx.registry.balanceOf(ctx.w1.address);
      expect(balance).to.eq(1);

      const owner = await ctx.registry.ownerOf(tokenId);
      expect(owner).to.eq(ctx.w1.address);

      const name = await ctx.registry.nameOf(tokenId);
      expect(name).to.eq("manin.doge");

      const reverseTokenId = await ctx.registry.reverseOf(ctx.w1.address);
      expect(reverseTokenId).to.eq(tokenId);

      let reverseName = await ctx.registry.reverseNameOf(ctx.w1.address);
      expect(reverseName).to.eq("manin.doge");

      await ctx.registry.mint(ctx.w1.address, ["second", "doge"], false);

      reverseName = await ctx.registry.reverseNameOf(ctx.w1.address);
      expect(reverseName).to.eq("manin.doge");
    });

    it("set reverse", async () => {
      const ctx = await setup();
      await ctx.registry.mintTLD("doge");

      const aToken = namehash("a.doge");
      await ctx.registry.mint(ctx.w1.address, ["a", "doge"], true);
      const bToken = namehash("b.doge");
      await ctx.registry.mint(ctx.w1.address, ["b", "doge"], true);
      await ctx.registry.mint(ctx.w1.address, ["c", "doge"], true);
      const otherToken = namehash("other.doge");
      await ctx.registry.mint(ctx.w2.address, ["other", "doge"], true);

      let reverseName = await ctx.registry.reverseNameOf(ctx.w1.address);
      expect(reverseName).to.eq("c.doge");

      // someone else can't
      let tx = ctx.registry.connect(ctx.w3).setReverse(ctx.w1.address, aToken);
      await expect(tx).to.be.reverted;

      // set to another domain you don't own
      tx = ctx.registry.connect(ctx.w1).setReverse(ctx.w1.address, otherToken);
      await expect(tx).to.be.reverted;

      // you can with any domain you own
      await ctx.registry.connect(ctx.w1).setReverse(ctx.w1.address, aToken);
      reverseName = await ctx.registry.reverseNameOf(ctx.w1.address);
      expect(reverseName).to.eq("a.doge");

      // Approve w3 to use b.doge
      await ctx.registry.connect(ctx.w1).approve(ctx.w3.address, bToken);
      await ctx.registry.connect(ctx.w3).setReverse(ctx.w1.address, bToken);
      reverseName = await ctx.registry.reverseNameOf(ctx.w1.address);
      expect(reverseName).to.eq("b.doge");
    });
  });
});
