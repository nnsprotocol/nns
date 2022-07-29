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

  const registrar = await ethers.getContract('BaseRegistrarImplementation')
  const priceOracle = await ethers.getContract('StablePriceOracle')
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar')
  const namedReservations = await ethers.getContract('NamedReservations')

  const controller = await deploy('NNSRegistrarControllerWithReservation', {
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

  const tx1 = await registrar.addController(controller.address, {
    from: deployer,
  })
  console.log(
    `Adding controller as controller on registrar (tx: ${tx1.hash})...`,
  )
  await tx1.wait()

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
  'BaseRegistrarImplementation',
  'NamedReservations',
  'StablePriceOracle',
]

export default func
