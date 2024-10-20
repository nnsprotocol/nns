import { namehash, Signer, ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";
import {
  getEcosystemRewarder,
  getNNSController,
  getNNSResolverToken,
  getNNSRewarder,
  getRegistry,
} from "../tasks/helpers";
import {
  CldRegistry,
  ERC20,
  NNSController,
  NNSRewarder,
} from "../typechain-types";
import { signRegistrationRequest } from "./helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe.skip("E2E", () => {
  let controller: NNSController;
  let rewarder: NNSRewarder;
  let txSigner: Signer;
  let userA: HardhatEthersSigner;
  let userB: HardhatEthersSigner;
  let ecosystemWallet: HardhatEthersSigner;
  let ecosystemTokenId: string;
  let nogs: ERC20;
  const nnsCldId = namehash("⌐◨-◨");
  // const nounsCldId = namehash("nns");
  let nnsRegistry: CldRegistry;
  const NNS_WALLET = "0x091fC3d6855712B4EAa74BCe26E5e733a9f0e60A";

  before(async () => {
    [, userA, userB, ecosystemWallet] = await ethers.getSigners();
    controller = await getNNSController(hre);
    rewarder = await getNNSRewarder(hre);
    // This is Account #10 created by Hardhat: 0xBcd4042DE499D14e55001CcbB24a551F3b954096
    txSigner = new ethers.Wallet(
      "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897"
    );
    nogs = await hre.ethers.getContractAt(
      "ERC20",
      "0x13741c5df9ab03e7aa9fb3bf1f714551dd5a5f8a"
    );
    nnsRegistry = await getRegistry(hre, "⌐◨-◨");
    const resolverToken = await getNNSResolverToken(hre);
    let ecosystemTokenName = "eco" + Date.now();
    ecosystemTokenId = namehash(ecosystemTokenName);
    await resolverToken.mint(ecosystemWallet, ecosystemTokenName);
  });

  it("buy a domain with signature", async () => {
    const expiry = (await time.latest()) + 10000;
    const name = Date.now().toString();
    const price = ethers.parseEther("0.001");
    const nonce = Math.floor(Math.random() * 1000);
    const signature = await signRegistrationRequest(txSigner, {
      to: userA.address,
      cldId: nnsCldId,
      expiry,
      name,
      nonce,
      periods: 0,
      price,
      referer: userB.address,
      withReverse: true,
    });

    await controller.registerWithSignature(
      userA.address,
      [name, "⌐◨-◨"],
      true,
      userB.address,
      0,
      price,
      nonce,
      expiry,
      signature,
      { value: price }
    );

    await expect(nogs.balanceOf(rewarder)).to.eventually.be.greaterThan(0);
    await expect(
      nnsRegistry.ownerOf(namehash(`${name}.⌐◨-◨`))
    ).to.eventually.eq(userA.address);

    await rewarder.withdraw(NNS_WALLET, [], []);
    await expect(rewarder.balanceOf(NNS_WALLET, [], [])).to.eventually.eq(0);

    await expect(
      rewarder.balanceOf(ecosystemWallet, [], [ecosystemTokenId])
    ).to.eventually.eq(0);

    const ecosRew = await getEcosystemRewarder(hre);
    await ecosRew.takeSnapshot();

    await expect(
      rewarder.balanceOf(ecosystemWallet, [], [ecosystemTokenId])
    ).to.eventually.gt(0);
  });
});
