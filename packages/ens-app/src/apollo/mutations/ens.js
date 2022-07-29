import { getNetworkId, setupENS } from '@ensdomains/ui'
import { isENSReadyReactive } from '../reactiveVars'

let ens = {},
  registrar = {},
  ensRegistryAddress = undefined

export async function setup({
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  customProvider,
  ensAddress
}) {
  let option = {
    reloadOnAccountsChange: true,
    enforceReadOnly: false,
    enforceReload: false,
    customProvider,
    ensAddress: {
      '1': process.env.REACT_APP_ENS_ADDRESS_MAINNET,
      '5': process.env.REACT_APP_ENS_ADDRESS_GOERLI
    }
  }

  const {
    ens: ensInstance,
    registrar: registrarInstance,
    providerObject,
    network
  } = await setupENS(option)
  ens = ensInstance
  registrar = registrarInstance
  ensRegistryAddress = network.ensAddress
  isENSReadyReactive(true)
  return { ens, registrar, providerObject }
}

export function getRegistrar() {
  return registrar
}

export function getEnsAddress() {
  return ensRegistryAddress
}

export default function getENS() {
  return ens
}
