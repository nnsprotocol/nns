import { getProvider, setupWeb3, getNetworkId, getNetwork } from './web3'
import { ENS } from './ens.js'
import { setupRegistrar } from './registrar'
export { utils, ethers } from 'ethers'

export async function setupENS({
  customProvider,
  ensAddress,
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload
} = {}) {
  const { provider } = await setupWeb3({
    customProvider,
    reloadOnAccountsChange,
    enforceReadOnly,
    enforceReload,
    ensAddress
  })

  const networkId = await getNetworkId()
  let registryAddress = ensAddress
  if (typeof ensAddress === 'object') {
    if (!ensAddress[networkId]) {
      throw new Error(`missing ensAddress for network ${networkId}`)
    }
    registryAddress = ensAddress[networkId]
  }

  provider.network.ensAddress = registryAddress
  const ens = new ENS({ provider, networkId, registryAddress })
  const registrar = await setupRegistrar(ens.registryAddress)
  const network = await getNetwork()
  return {
    ens,
    registrar,
    provider: customProvider,
    network,
    providerObject: provider
  }
}

export * from './ens'
export * from './registrar'
export * from './web3'
export * from './constants/interfaces'
export * from './utils'
export * from './contracts'
