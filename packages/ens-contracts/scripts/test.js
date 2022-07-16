const fs = require('fs')
const { hash: namehash } = require('eth-ens-namehash')

const labelhash = (label) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const TLD = '⌐◨-◨'

async function getContract(name) {
  const { address } = JSON.parse(
    fs.readFileSync(`deployments/localhost/${name}.json`),
  )
  const contract = await ethers.getContractFactory(name)
  return await contract.attach(address)
}

async function main() {
  const registry = await getContract('ENSRegistry')
  const root = await getContract('Root')
  const registrar = await getContract('BaseRegistrarImplementation')

  // test ...
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
