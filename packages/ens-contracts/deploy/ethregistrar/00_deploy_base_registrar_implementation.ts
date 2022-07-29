import namehash from 'eth-ens-namehash'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { keccak256 } from 'js-sha3'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network, userConfig } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()
  const { tld } = userConfig

  if (!network.tags.use_root) {
    return true
  }

  const registry = await ethers.getContract('ENSRegistry')
  const root = await ethers.getContract('Root')

  await deploy('BaseRegistrarImplementation', {
    from: deployer,
    args: [registry.address, namehash.hash(tld)],
    log: true,
  })

  const registrar = await ethers.getContract('BaseRegistrarImplementation')

  const tx1 = await registrar.addController(owner, { from: deployer })
  console.log(`Adding owner as controller to registrar (tx: ${tx1.hash})...`)
  await tx1.wait()

  const tx2 = await root
    .connect(await ethers.getSigner(owner))
    .setSubnodeOwner('0x' + keccak256(tld), registrar.address)
  console.log(
    `Setting owner of ${tld} node to registrar on root (tx: ${tx2.hash})...`,
  )
  await tx2.wait()
}

func.id = 'registrar'
func.tags = ['ethregistrar', 'BaseRegistrarImplementation']
func.dependencies = ['registry', 'root']

export default func
