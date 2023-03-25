import { Goerli, Mainnet } from "@usedapp/core";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export default {
  [Goerli.chainId]: {
    controller: new Contract(
      "0x7690388d4872D984890E50513069048b828A3474",
      new Interface(require("./abi/controller.json"))
    ),
    apiURL: "https://api.nns.xyz/goerli/nounishclub",
    openseaURL: (tokenId) =>
      `https://testnets.opensea.io/assets/goerli/0x8f701658c32fc0eb2b9e3ec536910739169b06bc/${BigNumber.from(
        tokenId
      ).toString()}`,
  },
  [Mainnet.chainId]: {
    controller: new Contract(
      "0xf55Fc3DF28eF7cbB579808fbAa90969a37a6E838",
      new Interface(require("./abi/controller.json"))
    ),
    apiURL: "https://api.nns.xyz/mainnet/nounishclub",
    openseaURL: (tokenId) =>
      `https://opensea.io/assets/ethereum/0x4af84535625fe40990bfb35019b944a9933f7593/${BigNumber.from(
        tokenId
      ).toString()}`,
  },
};
