const fs = require('fs')
const { network } = require('hardhat')
const { keccak256 } = require('js-sha3')

const labelhash = (label) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const TLD = '⌐◨-◨'

async function getContract(name) {
  const { address } = JSON.parse(
    fs.readFileSync(`deployments/${network.name}/${name}.json`),
  )
  const contract = await ethers.getContractFactory(name)
  return await contract.attach(address)
}

async function main() {
  const { network, userConfig } = hre;
  let usdOracleAddress = userConfig.networks?.[network.name]?.usdOracleAddress;
  if (network.name !== 'mainnet' && !usdOracleAddress) {
    const dummyOracle = await getContract("DummyOracle");
    usdOracleAddress = dummyOracle.address;
  }

  const StablePriceOracle = await ethers.getContractFactory("StablePriceOracle");
  const prices = [
    ethers.BigNumber.from('1000000000000000000000'),
    ethers.BigNumber.from('1000000000000000000000'),
    ethers.BigNumber.from('250000000000000000000'),
    ethers.BigNumber.from('100000000000000000000'),
    ethers.BigNumber.from('100000000000000000000'),
  ]
  const oracle = await StablePriceOracle.deploy(
    usdOracleAddress,
    prices
  );  
  console.log('Deploying new price oracle');
  await oracle.deployed();
  console.log(`Oracle deployed at ${oracle.address}`);

  const controller = await getContract('NNSRegistrarControllerWithReservation')
  const tx = await controller.setPriceOracle(oracle.address);
  console.log(`Changing price oracle: ${tx.hash}`)
  await tx.wait();
  console.log(`Done`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
