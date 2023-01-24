const fs = require('fs')
const { network } = require('hardhat')
const namehash = require('eth-ens-namehash')
const { keccak256 } = require('js-sha3')

const labelhash = (label) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const TLD = '⌐◨-◨'

async function getContract(name) {
  const { address } = JSON.parse(
    fs.readFileSync(`deployments/${network.name}/${name}.json`),
  )
  return getContractAt(name, address);
}

async function getContractAt(name, address) {
  const contract = await ethers.getContractFactory(name)
  return await contract.attach(address)
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const registry = await getContract("ENSRegistry");
  const oldRegistrar = await getContractAt("BaseRegistrarImplementation", "0x3D5a7c03A2f3B1938930A5ac3f7ad6e11C9595C5");
  const newRegistrar = await getContract("BaseRegistrarImplementation");

  const sentLogs = await oldRegistrar.queryFilter(
    oldRegistrar.filters.Transfer('0x0000000000000000000000000000000000000000', null),
  );

  for (const r of sentLogs) {
    const tokenId = r.args.tokenId.toHexString()
    const node = ethers.utils.keccak256(ethers.utils.concat([
      '0x739305fdceb24221237c3dea9f36a6fcc8dc81b45730358192886e1510532739',
      ethers.utils.arrayify(tokenId)
    ]));
    const registrant = await oldRegistrar.ownerOf(tokenId);
    const ctrl = await registry.owner(node);
    console.log({registrant, ctrl, r: newRegistrar.address, tokenId})
    // if (await hasCode(ctrl)) {
    //   console.log('Register Only')
    //   newRegistrar.registerOnly(tokenId, registrant)
    //   return;
    // }
    // await newRegistrar.register(tokenId, registrant);  
    return
  }
}

async function hasCode(addr) {
  const code = await ethers.provider.getCode(addr)
  return code !== '0x'
}

// 91195271541220817655397543024606004773783297329021569224759732168191164795813
// 91195271541220817655397543024606004773783297329021569224759732168191164795813

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
