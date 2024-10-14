import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers } from "hardhat";

async function setup() {
  const [owner, w1, w2, w3, w4, w5] = await ethers.getSigners();

  const resolverF = await ethers.getContractFactory("NNSResolver");
  const resolver = await resolverF.deploy();
  await resolver.initialize();

  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cldA = await cldFact.deploy("a", "a", owner, owner);
  const cldB = await cldFact.deploy("b", "b", owner, owner);
  const cldC = await cldFact.deploy("c", "c", owner, owner);
  const cldD = await cldFact.deploy("d", "d", owner, owner);

  return {
    resolver,
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
  };
}

type Context = Awaited<ReturnType<typeof setup>>;

describe("NNSResolver", () => {
  describe("registerCld", () => {
    let ctx: Context;

    before(async () => {
      ctx = await setup();
    });

    it("reverts when not called by the owner", async () => {
      const tx = ctx.resolver.connect(ctx.w1).registerCld(ctx.cldA, true);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.resolver,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("success with fallback", () => {
      let tx: ContractTransactionResponse;

      it("does not revert", async () => {
        tx = await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
      });

      it("changes the fallback cld", async () => {
        const fallback = await ctx.resolver.fallbackCld();
        expect(fallback).to.eq(ctx.cldAId);
      });

      it("emits CldRegistered", async () => {
        await expect(tx)
          .to.emit(ctx.resolver, "CldRegistered")
          .withArgs(ctx.cldAId, await ctx.cldA.getAddress());
      });

      it("emits FallbackCldChanged", async () => {
        await expect(tx)
          .to.emit(ctx.resolver, "FallbackCldChanged")
          .withArgs(ctx.cldAId);
      });

      it("reverts when registering the same cld twice", async () => {
        const tx = ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
        await expect(tx).to.be.revertedWithCustomError(
          ctx.resolver,
          "CldAlreadyRegistered"
        );
      });
    });

    describe("success without fallback", () => {
      let tx: ContractTransactionResponse;

      it("does not revert", async () => {
        tx = await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldB, false);
      });

      it("does not change the fallback cld", async () => {
        const fallback = await ctx.resolver.fallbackCld();
        expect(fallback).not.to.eq(ctx.cldBId);
      });

      it("does not emits FallbackCldChanged", async () => {
        await expect(tx).not.to.emit(ctx.resolver, "FallbackCldChanged");
      });
    });
  });

  describe("setFallbackCld", () => {
    it("reverts when the cldId is not registered", async () => {
      const ctx = await setup();
      const tx = ctx.resolver.connect(ctx.owner).setFallbackCld(99999);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.resolver,
        "InvalidCld"
      );
    });

    it("reverts when not called by the owner", async () => {
      const ctx = await setup();
      const tx = ctx.resolver.connect(ctx.w3).setFallbackCld(99999);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.resolver,
        "OwnableUnauthorizedAccount"
      );
    });

    describe("success", () => {
      let tx: ContractTransactionResponse;
      let ctx: Context;

      before(async () => {
        ctx = await setup();
        await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
        await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldB, false);
        await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldD, false);
      });

      it("does not revert", async () => {
        tx = await ctx.resolver.connect(ctx.owner).setFallbackCld(ctx.cldDId);
      });

      it("changes the fallback cld", async () => {
        const fallback = await ctx.resolver.fallbackCld();
        expect(fallback).to.eq(ctx.cldDId);
      });

      it("emits FallbackCldChanged", async () => {
        await expect(tx)
          .to.emit(ctx.resolver, "FallbackCldChanged")
          .withArgs(ctx.cldDId);
      });
    });
  });

  describe("setDefaultCld", () => {
    let ctx: Context;

    before(async () => {
      ctx = await setup();
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldB, false);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldD, false);
    });

    it("should revert when the caller is not the owner and not approved", async () => {
      const tx = ctx.resolver.connect(ctx.w2).setDefaultCld(ctx.w1, ctx.cldAId);
      await expect(tx).to.revertedWithCustomError(
        ctx.resolver,
        "UnauthorizedAccount"
      );
    });

    it("should succeed when the caller is the owner", async () => {
      const tx = await ctx.resolver
        .connect(ctx.w1)
        .setDefaultCld(ctx.w1, ctx.cldAId);

      await expect(tx)
        .to.emit(ctx.resolver, "DefaultCldChanged")
        .withArgs(ctx.w1.address, ctx.cldAId);
    });

    it("should succeed when the caller is approved by the owner", async () => {
      await ctx.cldA.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      const tx = await ctx.resolver
        .connect(ctx.w2)
        .setDefaultCld(ctx.w1, ctx.cldAId);

      await expect(tx)
        .to.emit(ctx.resolver, "DefaultCldChanged")
        .withArgs(ctx.w1.address, ctx.cldAId);
    });
  });

  describe("reverse management", () => {
    let ctx: Context;

    before(async () => {
      ctx = await setup();
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldB, false);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldC, false);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldD, false);

      // w1 and w2 have 2 domains each CLD, one set as the reverse.

      await ctx.cldA
        .connect(ctx.owner)
        .register(ctx.w1, "w1-a", [], [], 0, true);
      await ctx.cldA
        .connect(ctx.owner)
        .register(ctx.w1, "w1-no-a", [], [], 0, false);

      await ctx.cldB
        .connect(ctx.owner)
        .register(ctx.w1, "w1-b", [], [], 0, true);
      await ctx.cldB
        .connect(ctx.owner)
        .register(ctx.w1, "w1-no-b", [], [], 0, false);

      await ctx.cldC
        .connect(ctx.owner)
        .register(ctx.w1, "w1-c", [], [], 0, true);
      await ctx.cldC
        .connect(ctx.owner)
        .register(ctx.w1, "w1-no-c", [], [], 0, false);

      await ctx.cldA
        .connect(ctx.owner)
        .register(ctx.w2, "w2-a", [], [], 0, true);
      await ctx.cldA
        .connect(ctx.owner)
        .register(ctx.w2, "w2-no-a", [], [], 0, false);

      await ctx.cldB
        .connect(ctx.owner)
        .register(ctx.w2, "w2-b", [], [], 0, true);
      await ctx.cldB
        .connect(ctx.owner)
        .register(ctx.w2, "w2-no-b", [], [], 0, false);

      await ctx.cldC
        .connect(ctx.owner)
        .register(ctx.w2, "w2-c", [], [], 0, true);
      await ctx.cldC
        .connect(ctx.owner)
        .register(ctx.w2, "w2-no-c", [], [], 0, false);
    });

    describe("reverse of address", () => {
      before(async () => {
        // setting A as fallback
        await ctx.resolver.connect(ctx.owner).setFallbackCld(ctx.cldAId);
      });

      it("should resolve to the name on the fallback cld", async () => {
        const name = await ctx.resolver["reverseNameOf(address)"](ctx.w1);
        expect(name).to.eq("w1-a.a");
      });

      it("should resolve to the tokenid on the fallback cld", async () => {
        const { cldId, tokenId } = await ctx.resolver["reverseOf(address)"](
          ctx.w1
        );
        expect(cldId).to.eq(ctx.cldAId);
        expect(tokenId).to.eq(namehash("w1-a.a"));
      });

      describe("custom default", () => {
        before(async () => {
          await ctx.resolver.connect(ctx.w1).setDefaultCld(ctx.w1, ctx.cldBId);
        });

        it("should resolve to the name on the default cld", async () => {
          const name = await ctx.resolver["reverseNameOf(address)"](ctx.w1);
          expect(name).to.eq("w1-b.b");
        });

        it("should resolve to the tokenid on the default cld", async () => {
          const { cldId, tokenId } = await ctx.resolver["reverseOf(address)"](
            ctx.w1
          );
          expect(cldId).to.eq(ctx.cldBId);
          expect(tokenId).to.eq(namehash("w1-b.b"));
        });
      });
    });

    describe("reverse of address in clds", () => {
      it("should resolve to the name on the first clds that has one", async () => {
        const name = await ctx.resolver[
          "reverseNameOf(address,uint256[],bool)"
        ](
          ctx.w1,
          [ctx.cldDId, ctx.cldCId, ctx.cldAId], // D has no reverse
          false
        );
        expect(name).to.eq("w1-c.c");
      });

      it("should resolve to the name on the fallback CLD when no found", async () => {
        const name = await ctx.resolver[
          "reverseNameOf(address,uint256[],bool)"
        ](ctx.w1, [ctx.cldDId], true);
        expect(name).to.eq("w1-b.b");
      });

      it("should return an empty string when no lookup can be found", async () => {
        const name = await ctx.resolver[
          "reverseNameOf(address,uint256[],bool)"
        ](ctx.w1, [ctx.cldDId], false);
        expect(name).to.eq("");
      });

      it("should resolve to the tokenid on the first clds that has one", async () => {
        const { tokenId, cldId } = await ctx.resolver[
          "reverseOf(address,uint256[],bool)"
        ](ctx.w1, [ctx.cldDId, ctx.cldCId, ctx.cldAId], false);
        expect(tokenId).to.eq(namehash("w1-c.c"));
        expect(cldId).to.eq(ctx.cldCId);
      });

      it("should resolve to the tokenId on the fallback CLD when no found", async () => {
        const { tokenId, cldId } = await ctx.resolver[
          "reverseOf(address,uint256[],bool)"
        ](ctx.w1, [ctx.cldDId], true);
        expect(tokenId).to.eq(namehash("w1-b.b"));
        expect(cldId).to.eq(ctx.cldBId);
      });

      it("should return zero when no lookup can be found", async () => {
        const { tokenId, cldId } = await ctx.resolver[
          "reverseOf(address,uint256[],bool)"
        ](ctx.w1, [ctx.cldDId], false);
        expect(tokenId).to.eq(0);
        expect(cldId).to.eq(0);
      });
    });
  });

  describe("records", () => {
    let ctx: Context;
    let tokenIdA: string;
    let tokenIdB: string;

    before(async () => {
      ctx = await setup();
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldA, true);
      await ctx.resolver.connect(ctx.owner).registerCld(ctx.cldB, false);

      tokenIdA = namehash("w1-a.a");
      tokenIdB = namehash("w1-b.b");

      await ctx.cldA
        .connect(ctx.owner)
        .register(ctx.w1, "w1-a", [], [], 0, true);
      await ctx.cldB
        .connect(ctx.owner)
        .register(ctx.w1, "w1-b", [], [], 0, true);

      await ctx.cldA.connect(ctx.w1).setRecord(tokenIdA, 1, "AAA");
      await ctx.cldB.connect(ctx.w1).setRecord(tokenIdB, 2, "BBB");
    });

    it("recordOf - reverts when the cldId is not registered", async () => {
      const tx = ctx.resolver.connect(ctx.owner).recordOf(ctx.cldDId, 1, 1);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.resolver,
        "InvalidCld"
      );
    });

    it("recordsOf - reverts when the cldId is not registered", async () => {
      const tx = ctx.resolver
        .connect(ctx.owner)
        .recordsOf(ctx.cldDId, tokenIdA, [1]);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.resolver,
        "InvalidCld"
      );
    });

    it("recordOf - returns the record from the cld", async () => {
      const value = await ctx.resolver
        .connect(ctx.owner)
        .recordOf(ctx.cldAId, tokenIdA, 1);
      expect(value).to.eq("AAA");
    });

    it("recordsOf - returns the records from the cld", async () => {
      const values = await ctx.resolver
        .connect(ctx.owner)
        .recordsOf(ctx.cldBId, tokenIdB, [2]);
      expect(values[0]).to.eq("BBB");
    });
  });
});
