import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransactionResponse, namehash } from "ethers";
import { ethers, network } from "hardhat";

async function setup() {
  const [deployer, w1, w2, w3, minter, community] = await ethers.getSigners();

  const name = "noggles";
  const cldFact = await ethers.getContractFactory("CldRegistry");
  const cld = await cldFact.deploy(name, `${name}-SYMBOL`, minter, community);
  const cldId = namehash(name);

  return {
    deployer,
    w1,
    w2,
    w3,
    minter,
    community,
    cld,
    cldId,
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
  const tokenId = namehash(`${name}.${ctx.name}`);

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
    .register(owner, name, [], [], duration, opt?.withReverse || false);
  const mintBlock = await time.latestBlock();
  await time.increase(100);
  return { name, tokenId, mintBlock };
}

async function registerSubdomain(
  ctx: Context,
  owner: HardhatEthersSigner,
  parentTokenId?: string
) {
  const name = generateRandomString(10).toLowerCase();
  if (!parentTokenId) {
    const parent = await registerName(ctx, owner, {
      type: "perpetual",
    });
    parentTokenId = parent.tokenId;
  }
  const parentName = await ctx.cld.nameOf(parentTokenId);
  const fullName = `${name}.${parentName}`;
  const subdomainId = namehash(fullName);

  await ctx.cld.connect(owner).registerSubdomain(parentTokenId, name);

  return {
    fullName,
    subdomain: name,
    subdomainId,
    parentTokenId,
  };
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
      const tx = ctx.cld
        .connect(ctx.w1)
        .register(ctx.w1, "xxx", [], [], 0, false);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("reverts when the name is empty", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.minter)
        .register(ctx.w1, "", [], [], 0, false);
      await expect(tx).to.revertedWithCustomError(ctx.cld, "InvalidName");
    });

    describe("register of a non-expiring new domain with reverse", () => {
      let tx: ContractTransactionResponse;
      const domainName = "hello";
      let tokenId: string;

      let ctx: Context;
      before(async () => {
        ctx = await setup();
        tokenId = namehash(`${domainName}.${ctx.name}`);
      });

      it("does not revert", async () => {
        tx = await ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, [], [], 0, true);
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
          .withArgs(ctx.cldId, ctx.w1, 0, tokenId);
      });

      it("emits a NameRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRegistered")
          .withArgs(ctx.cldId, tokenId, domainName, ctx.w1, 0);
      });

      it("reverts when registering the same name twice", async () => {
        const tx = ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, [], [], 0, true);

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
      let tokenId: string;
      let registerTimestamp: number;
      let subdomains: string[] = [];

      before(async () => {
        ctx = await setup();
        tx = await ctx.cld
          .connect(ctx.minter)
          .register(ctx.w1, domainName, [], [], 10, true);
        tokenId = namehash(`${domainName}.${ctx.name}`);

        subdomains = [];
        let s = await registerSubdomain(ctx, ctx.w1, tokenId);
        subdomains.push(s.subdomainId);
        s = await registerSubdomain(ctx, ctx.w1, tokenId);
        subdomains.push(s.subdomainId);
        s = await registerSubdomain(ctx, ctx.w1, tokenId);
        subdomains.push(s.subdomainId);

        await time.increase(100);
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
          .register(
            ctx.w2,
            domainName,
            [namehash("record.key")],
            ["record.value"],
            80,
            true
          );
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

      it("removes all subdomains", async () => {
        const subdomains = await ctx.cld.subdomainsOf(tokenId);
        expect(subdomains).to.have.length(0);
      });

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
          .withArgs(ctx.cldId, ctx.w2, 0, tokenId);
      });

      it("emits a NameRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "NameRegistered")
          .withArgs(
            ctx.cldId,
            tokenId,
            domainName,
            ctx.w2,
            registerTimestamp + 80
          );
      });

      it("emits a RecordSet event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "RecordSet")
          .withArgs(ctx.cldId, tokenId, namehash("record.key"), "record.value");
      });

      it("emits a SubdomainDeleted event each subdomain", async () => {
        for (const s of subdomains) {
          await expect(tx)
            .to.emit(ctx.cld, "SubdomainDeleted")
            .withArgs(ctx.cldId, s);
        }
      });

      it("reverts when registering a non expired name", async () => {
        const tx = ctx.cld
          .connect(ctx.minter)
          .register(ctx.w2, domainName, [], [], 100, true);

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
          .withArgs(ctx.cldId, tokenId, EXTENSION_DURATION + originalExpiry);
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
          .withArgs(
            ctx.cldId,
            tokenId,
            extensionTimestamp + EXTENSION_DURATION
          );
      });
    });
  });

  describe("registerSubdomain", () => {
    it("reverts when parent does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .registerSubdomain(namehash("idonotexist"), "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when parent is not owned by the caller", async () => {
      const ctx = await setup();

      const parent = await registerName(ctx, ctx.w2, {
        type: "perpetual",
      });

      const tx = ctx.cld
        .connect(ctx.w1)
        .registerSubdomain(parent.tokenId, "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("reverts when parent is a subdomain", async () => {
      const ctx = await setup();

      const parent = await registerName(ctx, ctx.w2, {
        type: "perpetual",
      });
      const sub = await registerSubdomain(ctx, ctx.w2, parent.tokenId);

      const tx = ctx.cld
        .connect(ctx.w1)
        .registerSubdomain(sub.subdomainId, "hello");
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    describe("success", () => {
      let ctx: Context;
      let parentName: string;
      let parentId: string;
      let tx: ContractTransactionResponse;
      const subdomain = "hello";
      let subdomainId: string;

      before(async () => {
        ctx = await setup();
        const d = await registerName(ctx, ctx.w1, {
          type: "perpetual",
        });
        parentName = d.name;
        parentId = d.tokenId;
        subdomainId = namehash(`${subdomain}.${parentName}.${ctx.name}`);
      });

      it("does not revert", async () => {
        tx = await ctx.cld
          .connect(ctx.w1)
          .registerSubdomain(parentId, subdomain);
      });

      it("emits a SubdomainRegistered event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "SubdomainRegistered")
          .withArgs(ctx.cldId, parentId, subdomain, subdomainId);
      });

      it("saves the parent", async () => {
        const p = await ctx.cld.parentOf(subdomainId);
        expect(p).to.eq(parentId);
      });

      it("saves the subdomain", async () => {
        const subdomains = await ctx.cld.subdomainsOf(parentId);
        expect(subdomains).to.have.length(1);
        expect(subdomains[0]).to.eq(subdomainId);
      });

      it("saves the name of the subdomain", async () => {
        const name = await ctx.cld.nameOf(subdomainId);
        expect(name).to.eq(`${subdomain}.${parentName}.${ctx.name}`);
      });

      it("reverts if subdomain already exists", async () => {
        const op = ctx.cld
          .connect(ctx.w1)
          .registerSubdomain(parentId, subdomain);
        await expect(op)
          .to.revertedWithCustomError(ctx.cld, "SubdomainAlreadyExists")
          .withArgs(parentId, subdomain);
      });
    });
  });

  describe("deleteSubdomain", () => {
    it("reverts when subdomain does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .deleteSubdomain(namehash("idonotexist"));
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721NonexistentToken"
      );
    });

    it("reverts when subdomain is owned by someone else", async () => {
      const ctx = await setup();
      const parent = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const sub = await registerSubdomain(ctx, ctx.w1, parent.tokenId);
      const tx = ctx.cld.connect(ctx.w2).deleteSubdomain(sub.subdomainId);
      await expect(tx).to.revertedWithCustomError(
        ctx.cld,
        "ERC721InsufficientApproval"
      );
    });

    it("reverts when called with parent token", async () => {
      const ctx = await setup();
      const parent = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const tx = ctx.cld.connect(ctx.w1).deleteSubdomain(parent.tokenId);
      await expect(tx)
        .to.revertedWithCustomError(ctx.cld, "NonexistentSubdomain")
        .withArgs(parent.tokenId);
    });

    describe("success", () => {
      let ctx: Context;
      let parentId: string;
      let tx: ContractTransactionResponse;
      let subdomainId: string;

      before(async () => {
        ctx = await setup();
        const parent = await registerName(ctx, ctx.w1, {
          type: "perpetual",
        });
        parentId = parent.tokenId;
        const sub = await registerSubdomain(ctx, ctx.w1, parent.tokenId);
        subdomainId = sub.subdomainId;

        // Register a few more to make sure we delete the correct one.
        await registerSubdomain(ctx, ctx.w1, parent.tokenId);
        await registerSubdomain(ctx, ctx.w1, parent.tokenId);
      });

      it("does not revert", async () => {
        tx = await ctx.cld.connect(ctx.w1).deleteSubdomain(subdomainId);
      });

      it("emits a SubdomainDeleted event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "SubdomainDeleted")
          .withArgs(ctx.cldId, subdomainId);
      });

      it("clears the parent", async () => {
        const p = await ctx.cld.parentOf(subdomainId);
        expect(p).to.eq(0);
      });

      it("removes the subdomain", async () => {
        const subdomains = await ctx.cld.subdomainsOf(parentId);
        expect(subdomains).not.to.include(subdomainId);
      });

      it("clears the name of the subdomain", async () => {
        const op = ctx.cld.nameOf(subdomainId);
        await expect(op).to.be.reverted;
      });

      it("reverts if subdomain does not exist", async () => {
        const op = ctx.cld
          .connect(ctx.w1)
          .deleteSubdomain(namehash("idonotexist"));
        await expect(op).to.revertedWithCustomError(
          ctx.cld,
          "ERC721NonexistentToken"
        );
      });
    });
  });

  describe("ownerOf", () => {
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

    it("reverts with a subdomain", async () => {
      const ctx = await setup();
      const sub = await registerSubdomain(ctx, ctx.w1);
      const tx = ctx.cld.ownerOf(sub.subdomainId);
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

    it("reverts with a subdomain", async () => {
      const ctx = await setup();
      const sub = await registerSubdomain(ctx, ctx.w1);
      const tx = ctx.cld.isApprovedOrOwner(ctx.w1, sub.subdomainId);
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

    it("returns the reverse tokenId for subdomains", async () => {
      const ctx = await setup();
      const { subdomainId } = await registerSubdomain(ctx, ctx.w1);
      await ctx.cld.connect(ctx.w1).setReverse(subdomainId, [], []);
      const revTokenId = await ctx.cld.reverseOf(ctx.w1);
      expect(revTokenId).to.eq(subdomainId);
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

    it("returns the name of the reverse when the token has not expired", async () => {
      const ctx = await setup();
      const { name } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
        withReverse: true,
      });
      const revName = await ctx.cld.reverseNameOf(ctx.w1);
      expect(revName).to.eq(`${name}.${ctx.name}`);
    });

    it("returns the name of the reverse for subdomains", async () => {
      const ctx = await setup();
      const { subdomainId, fullName } = await registerSubdomain(ctx, ctx.w1);
      await ctx.cld.connect(ctx.w1).setReverse(subdomainId, [], []);
      const name = await ctx.cld.reverseNameOf(ctx.w1);
      expect(name).to.eq(fullName);
    });
  });

  describe("setReverse", () => {
    it("reverts when the token does not exist", async () => {
      const ctx = await setup();
      const tx = ctx.cld
        .connect(ctx.w1)
        .setReverse(namehash("idontexist"), [], []);
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
      const tx = ctx.cld.connect(ctx.w1).setReverse(tokenId, [], []);
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
      const tx = ctx.cld.connect(ctx.w2).setReverse(tokenId, [], []);
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
      const tx = ctx.cld.connect(ctx.w2).setReverse(tokenId, [], []);
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
      await ctx.cld.connect(ctx.w2).setReverse(tokenId, [], []);
    });

    it("does not revert when approved for all", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      await ctx.cld.connect(ctx.w1).setApprovalForAll(ctx.w2, true);
      await ctx.cld.connect(ctx.w2).setReverse(tokenId, [], []);
    });

    describe("success", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let domain: Awaited<ReturnType<typeof registerName>>;
      let oldTokenId: string;
      const recordKey = namehash("record.key");
      const recordValue = namehash("record.value");

      it("does not revert", async () => {
        ctx = await setup();
        // register multiple names just to make sure
        await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        const old = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        oldTokenId = old.tokenId;
        domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        tx = await ctx.cld
          .connect(ctx.w1)
          .setReverse(domain.tokenId, [recordKey], [recordValue]);
      });

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
          .withArgs(ctx.cldId, ctx.w1, oldTokenId, domain.tokenId);
      });

      it("sets the given token as the reverse", async () => {
        const revTokenId = await ctx.cld.reverseOf(ctx.w1);
        expect(revTokenId).to.eq(domain.tokenId);
      });

      it("sets the given records", async () => {
        const values = await ctx.cld.recordsOf(domain.tokenId, [recordKey]);
        expect(values).to.have.length(1);
        expect(values[0]).to.eq(recordValue);
      });
    });

    describe("success with subdomain", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let parent: Awaited<ReturnType<typeof registerName>>;
      let subdomain: Awaited<ReturnType<typeof registerSubdomain>>;
      const recordKey = namehash("record.key");
      const recordValue = namehash("record.value");

      it("does not revert", async () => {
        ctx = await setup();
        parent = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        subdomain = await registerSubdomain(ctx, ctx.w1, parent.tokenId);
        tx = await ctx.cld
          .connect(ctx.w1)
          .setReverse(subdomain.subdomainId, [recordKey], [recordValue]);
      });

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
          .withArgs(ctx.cldId, ctx.w1, parent.tokenId, subdomain.subdomainId);
      });

      it("sets the given token as the reverse", async () => {
        const revTokenId = await ctx.cld.reverseOf(ctx.w1);
        expect(revTokenId).to.eq(subdomain.subdomainId);
      });

      it("sets the given records", async () => {
        const values = await ctx.cld.recordsOf(subdomain.subdomainId, [
          recordKey,
        ]);
        expect(values).to.have.length(1);
        expect(values[0]).to.eq(recordValue);
      });

      it("returns the correct reverse name", async () => {
        const name = await ctx.cld.reverseNameOf(ctx.w1);
        expect(name).to.eq(subdomain.fullName);
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
      let tokenId: string;
      it("does not revert", async () => {
        ctx = await setup();
        const domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        tokenId = domain.tokenId;
        tx = await ctx.cld.connect(ctx.w1).deleteReverse(ctx.w1);
      });

      it("emits a ReverseChanged event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "ReverseChanged")
          .withArgs(ctx.cldId, ctx.w1, tokenId, 0);
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

    it("reverts with a subdomain", async () => {
      const ctx = await setup();
      const sub = await registerSubdomain(ctx, ctx.w1);
      const tx = ctx.cld.approve(ctx.w2, sub.subdomainId);
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

    it("reverts with a subdomain", async () => {
      const ctx = await setup();
      const sub = await registerSubdomain(ctx, ctx.w1);
      const tx = ctx.cld.getApproved(sub.subdomainId);
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

    it("reverts with a subdomain", async () => {
      const ctx = await setup();
      const sub = await registerSubdomain(ctx, ctx.w1);
      const tx = ctx.cld.transferFrom(ctx.w1, ctx.w2, sub.subdomainId);
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

    it("reverts when sender is not the owner of the parent domain", async () => {
      const ctx = await setup();
      const parent = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const { subdomainId } = await registerSubdomain(
        ctx,
        ctx.w1,
        parent.tokenId
      );
      const tx = ctx.cld
        .connect(ctx.w2)
        .setRecord(subdomainId, namehash("key"), "hello");
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

    it("returns an empty string when the domain has expired", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "expired",
      });
      const v = await ctx.cld.recordOf(tokenId, namehash("key"));
      expect(v).to.eq("");
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
          .withArgs(ctx.cldId, domain.tokenId, key, value);
      });

      it("stores the record", async () => {
        const v = await ctx.cld.recordOf(domain.tokenId, key);
        expect(v).to.eq(value);
      });
    });

    describe("success with subdomain", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let subdomain: Awaited<ReturnType<typeof registerSubdomain>>;
      const key = namehash("recordkey");
      const value = "hello";

      it("does not revert", async () => {
        ctx = await setup();
        const domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        subdomain = await registerSubdomain(ctx, ctx.w1, domain.tokenId);
        tx = await ctx.cld
          .connect(ctx.w1)
          .setRecord(subdomain.subdomainId, key, value);
      });

      it("emits a RecordSet event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "RecordSet")
          .withArgs(ctx.cldId, subdomain.subdomainId, key, value);
      });

      it("stores the record", async () => {
        const v = await ctx.cld.recordOf(subdomain.subdomainId, key);
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

    it("reverts when sender is not the owner of the parent domain", async () => {
      const ctx = await setup();
      const parent = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const { subdomainId } = await registerSubdomain(
        ctx,
        ctx.w1,
        parent.tokenId
      );
      const tx = ctx.cld
        .connect(ctx.w2)
        .setRecords(subdomainId, [namehash("key")], ["hello"]);
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
            .withArgs(ctx.cldId, domain.tokenId, key, values[i]);
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

    describe("success with subdomain", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let subdomain: Awaited<ReturnType<typeof registerSubdomain>>;
      const keys = [namehash("r1"), namehash("r2")];
      const values = ["v1", "v2"];

      it("does not revert", async () => {
        ctx = await setup();
        const domain = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: false,
        });
        subdomain = await registerSubdomain(ctx, ctx.w1, domain.tokenId);
        tx = await ctx.cld
          .connect(ctx.w1)
          .setRecords(subdomain.subdomainId, keys, values);
      });

      keys.forEach((key, i) => {
        it(`emits a RecordSet event for key: ${i}`, async () => {
          await expect(tx)
            .to.emit(ctx.cld, "RecordSet")
            .withArgs(ctx.cldId, subdomain.subdomainId, key, values[i]);
        });

        it(`stores the record for key: ${i}`, async () => {
          const v = await ctx.cld.recordOf(subdomain.subdomainId, key);
          expect(v).to.eq(values[i]);
        });
      });

      it("returns all records at once", async () => {
        const vs = await ctx.cld.recordsOf(subdomain.subdomainId, [
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

    it("reverts when sender is not the owner of the parent domain", async () => {
      const ctx = await setup();
      const parent = await registerName(ctx, ctx.w1, {
        type: "not-expired",
      });
      const { subdomainId } = await registerSubdomain(
        ctx,
        ctx.w1,
        parent.tokenId
      );
      const tx = ctx.cld.connect(ctx.w2).resetRecords(subdomainId);
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
          .withArgs(ctx.cldId, domain.tokenId);
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

    describe("success with subdomain", () => {
      let ctx: Context;
      let tx: ContractTransactionResponse;
      let subdomain: Awaited<ReturnType<typeof registerSubdomain>>;

      it("does not revert", async () => {
        ctx = await setup();
        const parent = await registerName(ctx, ctx.w1, {
          type: "not-expired",
          withReverse: true,
        });
        subdomain = await registerSubdomain(ctx, ctx.w1, parent.tokenId);
        await ctx.cld
          .connect(ctx.w1)
          .setRecords(
            subdomain.subdomainId,
            [namehash("a"), namehash("b")],
            ["x", "y"]
          );

        tx = await ctx.cld.connect(ctx.w1).resetRecords(subdomain.subdomainId);
      });

      it("emits a RecordsReset event", async () => {
        await expect(tx)
          .to.emit(ctx.cld, "RecordsReset")
          .withArgs(ctx.cldId, subdomain.subdomainId);
      });

      it("resets all records", async () => {
        const v = await ctx.cld.recordsOf(subdomain.subdomainId, [
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

  describe("parentOf", async () => {
    it("returns zero when the subdomain doesn't exist", async () => {
      const ctx = await setup();
      const parentId = await ctx.cld.parentOf(namehash("idonotexist"));
      expect(parentId).to.eq(0);
    });

    it("returns zero when the token is not a subdomain", async () => {
      const ctx = await setup();
      const { tokenId } = await registerName(ctx, ctx.w1, {
        type: "perpetual",
      });
      const parentId = await ctx.cld.parentOf(tokenId);
      expect(parentId).to.eq(0);
    });

    it("returns the parent", async () => {
      const ctx = await setup();
      const { subdomainId, parentTokenId } = await registerSubdomain(
        ctx,
        ctx.w1
      );
      const parentId = await ctx.cld.parentOf(subdomainId);
      expect(parentId).to.eq(parentTokenId);
    });
  });

  describe("community role", async () => {
    it("is initially set to the given address", async () => {
      const ctx = await setup();
      const hasRole = await ctx.cld.hasCommunityRole(ctx.community);
      expect(hasRole).to.be.true;
    });

    it("reverts when someone transfers the role", async () => {
      const ctx = await setup();
      const tx = ctx.cld.connect(ctx.w1).transferCommunityRole(ctx.w2);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.cld,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("reverts when the minter transfers the role", async () => {
      const ctx = await setup();
      const tx = ctx.cld.connect(ctx.minter).transferCommunityRole(ctx.w2);
      await expect(tx).to.be.revertedWithCustomError(
        ctx.cld,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("transfers the role", async () => {
      const ctx = await setup();
      await ctx.cld.connect(ctx.community).transferCommunityRole(ctx.w2);
      const hasRoleOld = await ctx.cld.hasCommunityRole(ctx.community);
      expect(hasRoleOld).to.be.false;
      const hasRoleNew = await ctx.cld.hasCommunityRole(ctx.w2);
      expect(hasRoleNew).to.be.true;
    });
  });
});
