const fs = require('fs')
const { network } = require('hardhat')
const namehash = require('eth-ens-namehash');

const labelhash = (label) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const TLD = '⌐◨-◨'

async function getContract(name) {
  const { address } = JSON.parse(
    fs.readFileSync(`deployments/${network.name}/${name}.json`),
  )
  const contract = await ethers.getContractFactory(name)
  return await contract.attach(address)
}

async function main() {
  const controller = await getContract('NNSRegistrarControllerWithReservation');
  const tx = await controller.setEnableETHReservations(false);
  console.log(tx.hash);
  tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
