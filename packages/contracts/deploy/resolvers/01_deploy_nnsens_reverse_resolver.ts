import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network, ethers, userConfig } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const ethRegistryAddress =
    userConfig.networks?.[network.name]?.ethRegistryAddress ??
    '0x0000000000000000000000000000000000000000'

  const registry = await ethers.getContract('ENSRegistry')

  await deploy('NNSENSReverseResolver', {
    from: deployer,
    args: [registry.address, ethRegistryAddress],
    log: true,
  })
}

func.id = 'resolvers'
func.tags = ['resolvers', 'NNSENSReverseResolver']
func.dependencies = ['registry']

export default func
