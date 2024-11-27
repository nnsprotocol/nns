import { namehash } from "ethers";
import fs from "fs/promises";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

export async function getNNSController(hre: HardhatRuntimeEnvironment) {
  const name = "NNSController";
  return hre.ethers.getContractAt(name, await _getAddress(hre, `${name}Proxy`));
}

export async function getNNSResolver(hre: HardhatRuntimeEnvironment) {
  const name = "NNSResolver";
  return hre.ethers.getContractAt(name, await _getAddress(hre, `${name}Proxy`));
}

export async function getNNSRewarder(hre: HardhatRuntimeEnvironment) {
  const name = "NNSRewarder";
  return hre.ethers.getContractAt(name, await _getAddress(hre, `${name}Proxy`));
}

export async function getNNSResolverToken(hre: HardhatRuntimeEnvironment) {
  const name = "NNSResolverToken";
  return hre.ethers.getContractAt(name, await _getAddress(hre, name));
}

export async function getEcosystemRewarder(hre: HardhatRuntimeEnvironment) {
  const rewarder = await getNNSRewarder(hre);
  return hre.ethers.getContractAt(
    "ERC721BasedRewarder",
    await rewarder.ecosystemRewarder()
  );
}

export async function getHolderRewarder(hre: HardhatRuntimeEnvironment) {
  const rewarder = await getNNSRewarder(hre);
  return hre.ethers.getContractAt(
    "ERC721BasedRewarder",
    await rewarder.holderRewarder()
  );
}

export async function getAccountRewarder(hre: HardhatRuntimeEnvironment) {
  const rewarder = await getNNSRewarder(hre);
  return hre.ethers.getContractAt(
    "AccountRewarder",
    await rewarder.accountRewarder()
  );
}

export async function getRegistry(
  hre: HardhatRuntimeEnvironment,
  name: string
) {
  const controller = await getNNSController(hre);
  const regAddr = await controller.registryOf(namehash(name));
  return hre.ethers.getContractAt("CldRegistry", regAddr);
}

async function _getAddress(hre: HardhatRuntimeEnvironment, name: string) {
  const chainId = BigInt(await hre.network.provider.send("eth_chainId"));
  const deploymentAddressesPath = path.join(
    "ignition",
    "deployments",
    `chain-${chainId.toString(10)}`,
    "deployed_addresses.json"
  );
  const file = await fs.readFile(deploymentAddressesPath, "utf8");
  const addresses = JSON.parse(file);
  const address = addresses[`NNSModule#${name}`];
  if (!address) {
    throw new Error(
      `Address for contract ${name} not found in ${deploymentAddressesPath}`
    );
  }
  return address;
}
