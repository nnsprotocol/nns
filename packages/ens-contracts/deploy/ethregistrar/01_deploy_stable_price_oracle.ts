import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // FIXME: CHECK THIS AS WE NEED AN ORACLE IN MAINNET TOO
  if (network.name === 'mainnet') {
    return true
  }

  // DummyOracle with 1 ETH == 2000 USD
  const dummyOracle = await deploy('DummyOracle', {
    from: deployer,
    args: [ethers.BigNumber.from('200000000000')],
    log: true,
  })

  // 1 character names = $1000 (or 1000 * 1e18 attousd)
  // 2 character names = $500
  // 3 or more = $100
    const prices = [
      ethers.BigNumber.from('1000000000000000000000'),
      ethers.BigNumber.from('500000000000000000000'),
      ethers.BigNumber.from('100000000000000000000'),
      ethers.BigNumber.from('100000000000000000000'),
      ethers.BigNumber.from('100000000000000000000'),
  ];

  await deploy('StablePriceOracle', {
    from: deployer,
    args: [dummyOracle.address, prices],
    log: true,
  })
}

func.id = 'price-oracle'
func.tags = ['ethregistrar', 'StablePriceOracle', 'DummyOracle']
func.dependencies = ['registry']

export default func
