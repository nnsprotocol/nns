const fs = require('fs')
const { network } = require('hardhat')

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
  const reservations = await getContract('NamedReservations')

  // await reservations.reserveName()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
