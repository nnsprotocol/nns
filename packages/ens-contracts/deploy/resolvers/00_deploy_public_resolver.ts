import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import namehash from 'eth-ens-namehash'
import { keccak256 } from 'js-sha3'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, userConfig } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()
  const { tld } = userConfig;

  const registry = await ethers.getContract('ENSRegistry')
  // const nameWrapper = await ethers.getContract('NameWrapper')
  const controller = await ethers.getContract('NNSRegistrarControllerWithReservation')
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar')
  const registrar = await ethers.getContract('BaseRegistrarImplementation')
  const root = await ethers.getContract('Root');

  await deploy('PublicResolver', {
    from: deployer,
    args: [
      registry.address,
      // nameWrapper.address,
      controller.address,
      reverseRegistrar.address,
    ],
    log: true,
  })
  const publicResolver = await ethers.getContract('PublicResolver');

  const tx = await reverseRegistrar.setDefaultResolver(publicResolver.address, {
    from: deployer,
  })
  console.log(
    `Setting default resolver on ReverseRegistrar to resolver (tx: ${tx.hash})...`,
  )
  await tx.wait()

  const tx2 = await registrar
    .connect(await ethers.getSigner(owner))
    .setResolver(publicResolver.address);

  console.log(
    `Setting resolver for ${tld} on Registry to resolver (tx: ${tx2.hash})...`,
  )
  await tx2.wait()

  const tx3 = await controller
    .connect(await ethers.getSigner(owner))
    .setAsInterface(publicResolver.address);
  console.log(
    `Setting controller as implementer of controller interface (tx: ${tx2.hash})...`,
  )
  await tx3.wait()

  const tx4 = await root
    .connect(await ethers.getSigner(owner))
    .setSubnodeOwner(
        '0x' + keccak256(tld),
        owner,
    )
  console.log(
    `Tranferring ownership of tld back to deployer (tx: ${tx4.hash})...`,
  )
  await tx4.wait()

  const tx5 = await registry
    .connect(await ethers.getSigner(owner))
    .setSubnodeOwner(
        namehash.hash(tld),
        '0x' + keccak256('resolver'),
        owner,
    )
  console.log(
    `Setting owner of resolver.${tld} to ${owner} (tx: ${tx5.hash})...`,
  )
  await tx5.wait()

  const tx6 = await root
    .connect(await ethers.getSigner(owner))
    .setSubnodeOwner(
        '0x' + keccak256(tld),
        registrar.address,
    )
  console.log(
    `Tranferring ownership of tld back to the registrar (tx: ${tx6.hash})...`,
  )
  await tx6.wait()

  const tx7 = await publicResolver['setAddr(bytes32,address)'](
    namehash.hash(`resolver.${tld}`),
    publicResolver.address,
    {
      from: owner
    }
  )
  console.log(
    `Setting addr resolution for resolver.${tld} to public resolver (tx: ${tx7.hash})...`,
  )
  await tx7.wait()

  const tx8 = await registry
    .connect(await ethers.getSigner(owner))
    .setResolver(
        namehash.hash(`resolver.${tld}`),
        publicResolver.address,
    )
  console.log(
    `Setting resolver for resolver.${tld} to publicResolver (tx: ${tx8.hash})...`,
  )
  await tx8.wait()
}

func.id = 'resolver'
func.tags = ['resolvers', 'PublicResolver']
func.dependencies = ['registry', 'ethregistrar', 'wrapper', 'root']

export default func
