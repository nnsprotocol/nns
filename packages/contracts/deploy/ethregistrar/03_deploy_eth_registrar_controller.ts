import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, userConfig, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const ethRegistryAddress =
    userConfig.networks?.[network.name]?.ethRegistryAddress ??
    '0x0000000000000000000000000000000000000000'

  const registrar = await ethers.getContract('BaseRegistrarImplementationWithMetadata')
  const priceOracle = await ethers.getContract('StablePriceOracle')
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar')
  const namedReservations = await ethers.getContract('NamedReservations')

  const oldController = await ethers.getContractOrNull(
    'NNSRegistrarControllerWithReservation',
  )

  const { newlyDeployed } = await deploy('NNSRegistrarControllerWithReservation', {
    from: deployer,
    args: [
      registrar.address,
      priceOracle.address,
      60,
      86400,
      ethRegistryAddress,
      namedReservations.address,
    ],
    log: true,
  })
  if (!newlyDeployed) {
    return
  }

  const controller = await ethers.getContract("NNSRegistrarControllerWithReservation")
  const tx1 = await registrar.addController(controller.address, {
    from: deployer,
  })
  console.log(
    `Adding controller as controller on registrar (tx: ${tx1.hash})...`,
  )
  await tx1.wait()

  // if (oldController) {
  //   const tx = await registrar.removeController(oldController!.address, {
  //     from: deployer,
  //   })
  //   console.log(`Removing old controller from registrar (tx: ${tx.hash})...`)
  //   await tx.wait()
  // }

  const tx3 = await reverseRegistrar.setController(controller.address, {
    from: deployer,
  })
  console.log(
    `Setting controller of ReverseRegistrar to controller (tx: ${tx3.hash})...`,
  )
  await tx3.wait()
}

func.tags = ['ethregistrar', 'ETHRegistrarController']
func.dependencies = [
  'registry',
  'wrapper',
  'BaseRegistrarImplementationWithMetadata',
  'NamedReservations',
  'StablePriceOracle',
]

export default func