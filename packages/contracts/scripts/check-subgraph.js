const fs = require('fs')
const { network } = require('hardhat')
const namehash = require('eth-ens-namehash')
const { keccak256 } = require('js-sha3')
const { utils } = require('ethers')

const labelhash = (label) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const TLD = '⌐◨-◨'

async function getContract(name) {
  const { address } = JSON.parse(
    fs.readFileSync(`deployments/${network.name}/${name}.json`),
  )
  return getContractAt(name, address)
}

async function getContractAt(name, address) {
  const contract = await ethers.getContractFactory(name)
  return await contract.attach(address)
}

async function main() {
  // console.log(labelhash('dotnouns'))
  const ctrl = await getContractAt(
    'BaseRegistrarImplementationWithMetadata',
    '0x4af84535625fE40990bfB35019B944a9933f7593',
  )
  const x = await ctrl.queryFilter('NameRegistered', 15769389, 16989288)
  const tokens = x.map((e) => e.args.id)

  for (const t of tokens) {
    const cur = await check('nns', t)
    const updated = await check('nns-test', t)
    if (cur !== updated) {
      console.log(`${t.toHexString()}: ${cur} ❌ ${updated}`)
    } else {
      console.log(`${t.toHexString()}: ${cur} ✅`)
    }
  }
}

async function check(name, id) {
  const labelHash = utils.hexZeroPad(id, 32)
  const parent =
    '0x739305fdceb24221237c3dea9f36a6fcc8dc81b45730358192886e1510532739'

  const res = await fetch(
    `https://api.thegraph.com/subgraphs/name/apbigcod/${name}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
          domains(first:1, where:{labelhash:"${labelHash}", parent: "${parent}"}){
      	    labelName
          }
        }`,
      }),
    },
  )
  const b = await res.json()
  if (b.errors) {
    throw new Error(`error ${JSON.stringify(b.errors)} for ${id.toHexString()}`)
  }
  return b.data.domains?.[0]?.labelName
}

async function hasCode(addr) {
  const code = await ethers.provider.getCode(addr)
  return code !== '0x'
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
