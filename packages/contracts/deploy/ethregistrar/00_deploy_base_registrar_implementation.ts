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

  const { newlyDeployed } = await deploy('BaseRegistrarImplementationWithMetadata', {
    from: deployer,
    args: [registry.address, namehash.hash(tld)],
    log: true,
    skipIfAlreadyDeployed: true
  })
  if (!newlyDeployed) {
    return
  }

  const registrar = await ethers.getContract('BaseRegistrarImplementationWithMetadata')

  const tx0 = await registrar.setBaseURI(`https://metadata.nns.xyz/${network.name}/${registrar.address}/`)
  console.log(`Setting base URI (tx: ${tx0.hash})...`)
  await tx0.wait()

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
func.tags = ['ethregistrar', 'BaseRegistrarImplementationWithMetadata']
func.dependencies = ['registry', 'root']

export default func