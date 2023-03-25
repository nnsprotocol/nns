import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import namehash from 'eth-ens-namehash'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  return

  const { getNamedAccounts, deployments, network, ethers, userConfig } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  await deploy('ENSProxyResolver', {
    from: deployer,
    args: [
      registry.address,
      namehash.hash('⌐◨-◨'),
      Buffer.from(dnsName('notorious.eth').slice(2), 'hex').length,
    ],
    log: true,
  })
}

func.id = 'resolvers'
func.tags = ['resolvers', 'ENSProxyResolver']
func.dependencies = ['registry']

export default func

function dnsName(name: string) {
  // strip leading and trailing .
  const n = name.replace(/^\.|\.$/gm, '')

  const bufLen = n === '' ? 1 : n.length + 2
  const buf = Buffer.allocUnsafe(bufLen)
  let offset = 0
  if (n.length) {
    const list = n.split('.')
    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }
  buf[offset++] = 0
  return (
    '0x' +
    buf.reduce(
      (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
      '',
    )
  )
}
