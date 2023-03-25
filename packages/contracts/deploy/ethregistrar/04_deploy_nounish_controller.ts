import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const registrar = await ethers.getContract(
    'BaseRegistrarImplementationWithMetadata',
  )

  let signer
  switch (network.name) {
    case 'goerli':
      signer = '0x9283DE2Ef7939c297Ec6aFA608e5a6b4eE4025cc'
      break
    case 'mainnet':
      signer = '0x81dd08C90a679c0c4f8feb88A06cC77c03A8f412'
      break
    default:
      throw new Error('unknown network')
  }

  console.log(
    `Start deployment of NounishClubController with ${signer} as signer`,
  )

  const { newlyDeployed } = await deploy('NounishClubController', {
    from: deployer,
    args: [registrar.address, signer],
    log: true,
  })
  if (!newlyDeployed) {
    return
  }

  const controller = await ethers.getContract('NounishClubController')
  const tx1 = await registrar.addController(controller.address, {
    from: deployer,
  })
  console.log(
    `Adding controller as controller on registrar (tx: ${tx1.hash})...`,
  )
  await tx1.wait()
}

func.tags = ['ethregistrar', 'NounishClubController']
func.dependencies = [
  'registry',
  'wrapper',
  'BaseRegistrarImplementationWithMetadata',
]

export default func
