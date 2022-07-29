const fs = require('fs')
const { network } = require('hardhat')
const { keccak256 } = require('js-sha3')

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
  const registrar = await getContract('BaseRegistrarImplementation')

  const owner = ''
  const names = []

  for (const name of names) {
    console.log(`registering ${name}...`)
    await registrar.register('0x' + keccak256(name), owner)
    console.log(`${name} has been registered...`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
