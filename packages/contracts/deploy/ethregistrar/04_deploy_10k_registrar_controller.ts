import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, userConfig, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const registrar = await ethers.getContract(
    'BaseRegistrarImplementationWithMetadata',
  )

  const { newlyDeployed } = await deploy('TenKClubController', {
    from: deployer,
    args: [registrar.address, 4],
    log: true,
  })
  if (!newlyDeployed) {
    return
  }

  const controller = await ethers.getContract('TenKClubController')
  const tx1 = await registrar.addController(controller.address, {
    from: deployer,
  })
  console.log(
    `Adding controller as controller on registrar (tx: ${tx1.hash})...`,
  )
  await tx1.wait()
}

func.tags = ['ethregistrar', 'TenKClubController']
func.dependencies = [
  'registry',
  'wrapper',
  'BaseRegistrarImplementationWithMetadata',
]

export default func
