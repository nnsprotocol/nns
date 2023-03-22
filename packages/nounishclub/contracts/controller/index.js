const { Goerli } = require("@usedapp/core");
const { Contract } = require("@ethersproject/contracts");
const { Interface } = require("ethers/lib/utils");
const abi = require("./abi.json");

module.exports.contracts = {
  [Goerli.chainId]: new Contract(
    "0x3c802c0000e936a7a39784a120C0Fb8A524A9901", //process.env.NEXT_PUBLIC_CONTRACT_ID,
    new Interface(abi)
  ),
};

module.exports.resolvers = {
  [Goerli.chainId]: "0x063AFdADBAC8C97b6A1f8F9A52736203185021ba", //process.env.NEXT_PUBLIC_RESOLVERS_ID,
};
