import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network, ethers, userConfig } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const usdOracleAddress = userConfig.networks?.[network.name]?.usdOracleAddress

  let oracleAddress
  // check if there is a USD oracle in the config
  if (usdOracleAddress) {
    oracleAddress = usdOracleAddress
    console.log('Using USD Oracle with address: ', oracleAddress)
  } else {
    // No USD oracle ... deploy DummyOracle with 1 ETH == 2000 USD
    const dummyOracle = await deploy('DummyOracle', {
      from: deployer,
      args: [ethers.BigNumber.from('200000000000')],
      log: true,
    })
    oracleAddress = dummyOracle.address
    console.log('Using DummyOracle with address: ', oracleAddress)
  }

  // 1 character names = $1000 (or 1000 * 1e18 attousd)
  // 2 character names = $500
  // 3 character names = $250
  // 4 or more = $100
  const prices = [
    ethers.BigNumber.from('1000000000000000000000'),
    ethers.BigNumber.from('500000000000000000000'),
    ethers.BigNumber.from('250000000000000000000'),
    ethers.BigNumber.from('100000000000000000000'),
    ethers.BigNumber.from('100000000000000000000'),
  ]

  await deploy('StablePriceOracle', {
    from: deployer,
    args: [oracleAddress, prices],
    skipIfAlreadyDeployed: true,
    log: true,
  })
}

func.id = 'price-oracle'
func.tags = ['ethregistrar', 'StablePriceOracle', 'DummyOracle']
func.dependencies = ['registry']

export default func
