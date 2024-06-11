import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse, N, namehash } from "ethers";
import { ethers, network } from "hardhat";

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

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

type RegistrationType = "expired" | "perpetual" | "not-expired";

async function registerName(
  ctx: Context,
  owner: HardhatEthersSigner,
  opt?: {
    type?: RegistrationType;
    withReverse?: boolean;
  }
) {
  const name = generateRandomString(10).toLowerCase();
  const tokenId = namehash(name);

  let duration: number;
  switch (opt?.type || "perpetual") {
    case "expired":
      duration = 10;
      break;
    case "perpetual":
      duration = 0;
      break;
    case "not-expired":
      duration = 10000000;
      break;
  }

  await ctx.cld
    .connect(ctx.minter)
    .register(owner, name, duration, opt?.withReverse || false);
  const mintBlock = await time.latestBlock();
  await time.increase(100);
  return { name, tokenId, mintBlock };
}

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

    it("reverts when the name is empty", async () => {
      const ctx = await setup();
      const tx = ctx.cld.connect(ctx.minter).register(ctx.w1, "", 0, false);
      await expect(tx).to.revertedWithCustomError(ctx.cld, "InvalidName");
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

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
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

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
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

  describe("renew", () => {
    it("reverts when not called by the minter", async () => {
      const ctx = await setup();
      const tx = ctx.cld.connect(ctx.w1).renew(namehash("name"), 100);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("reverts when the token never expires", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });

      const tx = ctx.cld.connect(ctx.minter).renew(tokenId, 100);
      await expect(tx).to.revertedWithCustomError(ctx.cld, "NonExpiringToken");
    });

    it("reverts when the token never expires", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });

      const tx = ctx.cld.connect(ctx.minter).renew(tokenId, 100);
      await expect(tx).to.revertedWithCustomError(ctx.cld, "NonExpiringToken");
    });

    describe("token not yet expired", async () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let originalExpiry: bigint;
      let tokenId: string;
      const EXTENSION_DURATION = 12345n;

      it("does not revert", async () => {
        ctx = await setup();
        const d = await registerName(ctx, ctx.w1, {
          type: "not-expired",
        });
        tokenId = d.tokenId;

        originalExpiry = await ctx.cld.expiryOf(d.tokenId);

        tx = await ctx.cld
          .connect(ctx.minter)
          .renew(d.tokenId, EXTENSION_DURATION);
      });

      it("extends the expiry by the given duration", async () => {
        const newExpiry = await ctx.cld.expiryOf(tokenId);
        expect(newExpiry).to.eq(originalExpiry + EXTENSION_DURATION);
      });

      it("emits a NameRenewed event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRenewed")
          .withArgs(tokenId, EXTENSION_DURATION + originalExpiry);
      });
    });

    describe("token already expired", async () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let extensionTimestamp: number;
      let tokenId: string;
      const EXTENSION_DURATION = 12345;

      it("does not revert", async () => {
        ctx = await setup();
        const d = await registerName(ctx, ctx.w1, {
          type: "expired",
        });
        tokenId = d.tokenId;

        extensionTimestamp = (await time.latest()) + 100;
        await time.setNextBlockTimestamp(extensionTimestamp);

        tx = await ctx.cld
          .connect(ctx.minter)
          .renew(d.tokenId, EXTENSION_DURATION);
      });

      it("extends the expiry by the given duration", async () => {
        const newExpiry = await ctx.cld.expiryOf(tokenId);
        expect(newExpiry).to.eq(extensionTimestamp + EXTENSION_DURATION);
      });

      it("emits a NameRenewed event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRenewed")
          .withArgs(tokenId, extensionTimestamp + EXTENSION_DURATION);
      });
    });
  });

  describe("ownerOf", async () => {
    it("returns the owner when the domain does not expire", async () => {
      const ctx = await setup();
      const { tokenId, name } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const owner = await ctx.cld.ownerOf(tokenId);
      expect(owner).to.eq(ctx.w1);
    });

    it("returns the owner when the domain is not expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const owner = await ctx.cld.ownerOf(tokenId);
      expect(owner).to.eq(ctx.w1);
    });

    it("reverts when the token doesn't exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.ownerOf(namehash("idonotexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.ownerOf(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("isApprovedOrOwner", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.isApprovedOrOwner(ctx.w1, namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.isApprovedOrOwner(ctx.w1, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    (["not-expired", "perpetual"] as RegistrationType[]).forEach((type) => {
      describe(type, () => {
        it("returns true when for the owner", async () => {
          const ctx = await setup();
          const { tokenId } = await registerName(ctx, ctx.w1, {
            type,
          });
          const ok = await ctx.cld.isApprovedOrOwner(ctx.w1, tokenId);
          expect(ok).to.be.true;
        });

        it("returns true for the owner", async () => {
          const ctx = await setup();
          const { tokenId } = await registerName(ctx, ctx.w1, {
            type,
          });
          const ok = await ctx.cld.isApprovedOrOwner(ctx.w1, tokenId);
          expect(ok).to.be.true;
        });

        it("returns true for someone approved for the token", async () => {
          const ctx = await setup();
          const { tokenId } = await registerName(ctx, ctx.w1, {
            type,
          });
          await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
          const ok = await ctx.cld.isApprovedOrOwner(ctx.w2, tokenId);
          expect(ok).to.be.true;
        });

        it("returns true for someone approved for all", async () => {
          const ctx = await setup();
          const { tokenId } = await registerName(ctx, ctx.w1, {
            type,
          });
          await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w3, true);
          const ok = await ctx.cld.isApprovedOrOwner(ctx.w3, tokenId);
          expect(ok).to.be.true;
        });

        it("returns false for someone else", async () => {
          const ctx = await setup();
          const { tokenId } = await registerName(ctx, ctx.w1, {
            type,
          });
          const ok = await ctx.cld.isApprovedOrOwner(ctx.w3, tokenId);
          expect(ok).to.be.false;
        });
      });
    });
  });

  describe("tokenURI", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.tokenURI(namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.tokenURI(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("returns the expected uri", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const uri = await ctx.cld.tokenURI(tokenId);

      const registry = (await ctx.cld.getAddress()).toLowerCase();
      const chainId = network.config.chainId;
      const tokenIdDec = BigInt(tokenId).toString(10);

      expect(uri).to.eq(
        `https://metadata.nns.xyz/${chainId}/${registry}/${tokenIdDec}`
      );
    });
  });

  describe("nameOf", () => {
    it("reverts when the token token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.nameOf(namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.nameOf(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("returns the registered name when never expires", async () => {
      const ctx = await setup();
      const { tokenId, name } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const n = await ctx.cld.nameOf(tokenId);
      expect(n).to.eq(`${name}.${ctx.name}`);
    });

    it("returns the registered name when not expired", async () => {
      const ctx = await setup();
      const { tokenId, name } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const n = await ctx.cld.nameOf(tokenId);
      expect(n).to.eq(`${name}.${ctx.name}`);
    });
  });

  describe("reverseOf", () => {
    it("returns zero when there is no reverse set", async () => {
      const ctx = await setup();
      const tokenId = await ctx.cld.reverseOf(ctx.w1);
      expect(tokenId).to.eq(0);
    });

    it("returns zero when the token set as reverse has expired", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "expired",
        withReverse: true,
      });
      const reverseTokenId = await ctx.cld.reverseOf(ctx.w1);
      expect(reverseTokenId).to.eq(0);
    });

    it("returns the reverse tokenId when the token never expires", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
        withReverse: true,
      });
      const revTokenId = await ctx.cld.reverseOf(ctx.w1);
      expect(revTokenId).to.eq(tokenId);
    });

    it("returns the reverse tokenId when the token has not expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      const revTokenId = await ctx.cld.reverseOf(ctx.w1);
      expect(revTokenId).to.eq(tokenId);
    });
  });

  describe("reverseNameOf", () => {
    it("returns an empty string when there is no reverse set", async () => {
      const ctx = await setup();
      const revName = await ctx.cld.reverseNameOf(ctx.w1);
      expect(revName).to.eq("");
    });

    it("returns an empty string when the token set as reverse has expired", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "expired",
        withReverse: true,
      });
      const revName = await ctx.cld.reverseNameOf(ctx.w1);
      expect(revName).to.eq("");
    });

    it("returns the name of the reverse token when the token never expires", async () => {
      const ctx = await setup();
      const { name } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
        withReverse: true,
      });
      const revName = await ctx.cld.reverseNameOf(ctx.w1);
      expect(revName).to.eq(`${name}.${ctx.name}`);
    });

    it("returns the reverse tokenId when the token has not expired", async () => {
      const ctx = await setup();
      const { name } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      const revName = await ctx.cld.reverseNameOf(ctx.w1);
      expect(revName).to.eq(`${name}.${ctx.name}`);
    });
  });

  describe("setReverse", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .setReverse(ctx.w1, namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.connect(ctx.w1).setReverse(ctx.w1, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when sender is not the owner or approved", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const tx = ctx.cld.connect(ctx.w2).setReverse(ctx.w1, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("reverts when sender is approved for another token", async () => {
      const ctx = await setup();
      const another = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, another.tokenId);
      const tx = ctx.cld.connect(ctx.w2).setReverse(ctx.w1, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("does not revert when approved for the token", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      await ctx.cld.connect(ctx.w2).setReverse(ctx.w1, tokenId);
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld.connect(ctx.w2).setReverse(ctx.w1, tokenId);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let domain: Awaited<ReturnType<typeof registerName>>;
      it("does not revert", async () => {
        ctx = await setup();
        // register multiple names just to make sure
        await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        tx = await ctx.cld.connect(ctx.w1).setReverse(ctx.w1, domain.tokenId);
      });

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
          .withArgs(ctx.w1, domain.tokenId);
      });

      it("sets the given token as the reverse", async () => {
        const revTokenId = await ctx.cld.reverseOf(ctx.w1);
        expect(revTokenId).to.eq(domain.tokenId);
      });
    });
  });

  describe("deleteReverse", () => {
    it("reverts when sender is not the owner or approved for all", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      const tx = ctx.cld.connect(ctx.w2).deleteReverse(ctx.w1);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("reverts when there is no reverse set", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: false,
      });
      const tx = ctx.cld.connect(ctx.w1).deleteReverse(ctx.w1);
      await expect(tx)
        .to.revertedWithCustomError(ctx.cld, "NoReverseSet")
        .withArgs(ctx.w1);
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld.connect(ctx.w2).deleteReverse(ctx.w1);
    });

    it("does not revert when sender is the same", async () => {
      const ctx = await setup();
      await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      await ctx.cld.connect(ctx.w1).deleteReverse(ctx.w1);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      it("does not revert", async () => {
        ctx = await setup();
        await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        tx = await ctx.cld.connect(ctx.w1).deleteReverse(ctx.w1);
      });

      it("emits a ReverseDeleted event", async () => {
        await expect(tx).to.emit(ctx.cld, "ReverseDeleted").withArgs(ctx.w1);
      });

      it("clears the reverse", async () => {
        const revTokenId = await ctx.cld.reverseOf(ctx.w1);
        expect(revTokenId).to.eq(0);
      });
    });
  });

  describe("approve", async () => {
    it("reverts when the token doesn't exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .approve(ctx.w2, namehash("idonotexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("approves when not expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      const addr = await ctx.cld.getApproved(tokenId);
      expect(addr).to.eq(ctx.w2.address);
    });

    it("approves when never expires", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      const addr = await ctx.cld.getApproved(tokenId);
      expect(addr).to.eq(ctx.w2.address);
    });
  });

  describe("getApproved", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.getApproved(namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.getApproved(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("does not revert when the token is valid", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const addr = await ctx.cld.getApproved(tokenId);
      expect(addr).to.eq(ethers.ZeroAddress);
    });
  });

  describe("transferFrom", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .transferFrom(ctx.w1, ctx.w2, namehash("idontexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.connect(ctx.w1).transferFrom(ctx.w1, ctx.w2, tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let tokenId: string;
      let mintBlock: number;

      it("does not revert when the token is valid", async () => {
        ctx = await setup();
        const d = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        mintBlock = d.mintBlock;
        tokenId = d.tokenId;
        await ctx.cld
          .connect(ctx.w1)
          .setRecord(tokenId, namehash("record"), "value");

        tx = await ctx.cld
          .connect(ctx.w1)
          .transferFrom(ctx.w1, ctx.w2, tokenId);
        const owner = await ctx.cld.ownerOf(tokenId);
        expect(owner).to.eq(ctx.w2.address);
      });

      it("transfers the token to the new owner", async () => {
        const owner = await ctx.cld.ownerOf(tokenId);
        expect(owner).to.eq(ctx.w2.address);
      });

      it("emits a Transfer event", async () => {
        await expect(tx).to.emit(ctx.cld, "Transfer");
      });

      it("clears the reverse name", async () => {
        const reverse = await ctx.cld.reverseOf(ctx.w1);
        expect(reverse).to.eq(0);
      });

      it("clears the records", async () => {
        const v = await ctx.cld.recordOf(tokenId, namehash("record"));
        expect(v).to.eq("");
      });

      it("does not change the total supply", async () => {
        const totalSupply = await ctx.cld.totalSupply();
        expect(totalSupply).to.eq(1);
      });

      it("does not change the mint block", async () => {
        const block = await ctx.cld.mintBlockNumberOf(tokenId);
        expect(block).to.eq(mintBlock);
      });
    });
  });

  describe("setRecord/recordOf", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .setRecord(namehash("idontexist"), namehash("key"), "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld
        .connect(ctx.w1)
        .setRecord(tokenId, namehash("key"), "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when sender is not the owner or approved", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const tx = ctx.cld
        .connect(ctx.w2)
        .setRecord(tokenId, namehash("key"), "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("does not revert when approved for the token", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      await ctx.cld
        .connect(ctx.w2)
        .setRecord(tokenId, namehash("key"), "hello");
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld
        .connect(ctx.w2)
        .setRecord(tokenId, namehash("key"), "hello");
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let domain: Awaited<ReturnType<typeof registerName>>;
      const key = namehash("recordkey");
      const value = "hello";

      it("does not revert", async () => {
        ctx = await setup();
        domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        tx = await ctx.cld
          .connect(ctx.w1)
          .setRecord(domain.tokenId, key, value);
      });

      it("emits a RecordSet event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "RecordSet")
          .withArgs(domain.tokenId, key, value);
      });

      it("stores the record", async () => {
        const v = await ctx.cld.recordOf(domain.tokenId, key);
        expect(v).to.eq(value);
      });
    });
  });

  describe("setRecords/recordsOf", () => {
    it("reverts when sender is not the owner or approved", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const tx = ctx.cld
        .connect(ctx.w2)
        .setRecords(tokenId, [namehash("key")], ["hello"]);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("does not revert when approved for the token", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      await ctx.cld
        .connect(ctx.w2)
        .setRecords(tokenId, [namehash("key")], ["hello"]);
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld
        .connect(ctx.w2)
        .setRecords(tokenId, [namehash("key")], ["hello"]);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let domain: Awaited<ReturnType<typeof registerName>>;
      const keys = [namehash("r1"), namehash("r2")];
      const values = ["v1", "v2"];

      it("does not revert", async () => {
        ctx = await setup();
        domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        tx = await ctx.cld
          .connect(ctx.w1)
          .setRecords(domain.tokenId, keys, values);
      });

      keys.forEach((key, i) => {
        it(`emits a RecordSet event for key: ${i}`, async () => {
          await expect(tx)
            .to.emit(ctx.cld, "RecordSet")
            .withArgs(domain.tokenId, key, values[i]);
        });

        it(`stores the record for key: ${i}`, async () => {
          const v = await ctx.cld.recordOf(domain.tokenId, key);
          expect(v).to.eq(values[i]);
        });
      });

      it("returns all records at once", async () => {
        const vs = await ctx.cld.recordsOf(domain.tokenId, [
          ...keys,
          namehash("newkey"),
        ]);
        expect(vs.length).to.eq(3);
        expect(vs[0]).to.eq(values[0]);
        expect(vs[1]).to.eq(values[1]);
        expect(vs[2]).to.eq("");
      });
    });
  });

  describe("resetRecords", () => {
    it("reverts when sender is not the owner or approved", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const tx = ctx.cld.connect(ctx.w2).resetRecords(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("does not revert when approved for the token", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).approve(ctx.w2, tokenId);
      await ctx.cld.connect(ctx.w2).resetRecords(tokenId);
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld.connect(ctx.w2).resetRecords(tokenId);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let domain: Awaited<ReturnType<typeof registerName>>;

      it("does not revert", async () => {
        ctx = await setup();
        domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        await ctx.cld
          .connect(ctx.w1)
          .setRecords(
            domain.tokenId,
            [namehash("a"), namehash("b")],
            ["x", "y"]
          );

        tx = await ctx.cld.connect(ctx.w1).resetRecords(domain.tokenId);
      });

      it("emits a RecordsReset event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "RecordsReset")
          .withArgs(domain.tokenId);
      });

      it("resets all records", async () => {
        const v = await ctx.cld.recordsOf(domain.tokenId, [
          namehash("a"),
          namehash("b"),
        ]);
        expect(v[0]).to.eq("");
        expect(v[1]).to.eq("");
      });
    });
  });

  describe("mintBlockNumberOf", async () => {
    it("reverts when the token doesn't exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld.mintBlockNumberOf(namehash("idonotexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when the token has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const tx = ctx.cld.mintBlockNumberOf(tokenId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("returns the mint block when the domain does not expire", async () => {
      const ctx = await setup();
      const { tokenId, mintBlock } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const block = await ctx.cld.mintBlockNumberOf(tokenId);
      expect(block).to.eq(mintBlock);
    });

    it("returns the mint block when the domain is not expired", async () => {
      const ctx = await setup();
      const { tokenId, mintBlock } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const block = await ctx.cld.mintBlockNumberOf(tokenId);
      expect(block).to.eq(mintBlock);
    });
  });
});
