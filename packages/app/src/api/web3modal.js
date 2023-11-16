import { setupENS } from '@ensdomains/ui'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'
import { rpcUrl } from 'rpcUrl'

const projectId = '2b9721d85a7335f1bffd51b84a4ad573'

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl:
    'https://eth-mainnet.g.alchemy.com/v2/FzSjc5hFAWuIEOAAlPXK8tDYBESIw7ot'
}

const goerli = {
  chainId: 5,
  name: 'Goerli',
  currency: 'ETH',
  explorerUrl: 'https://goerli.etherscan.io',
  rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/FzSjc5hFAWuIEOAAlPXK8tDYBESIw7ot'
}

const metadata = {
  name: 'NNS',
  description: 'Nouns Name Service',
  url: 'https://app.nns.xyz',
  icons: ['https://app.nns.xyz/apple-touch-icon.png']
}

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, goerli],
  projectId
})

export async function connect() {
  try {
    try {
      await modal.disconnect()
    } catch (e) {}
    await modal.open({ view: 'Connect' })

    const provider = await new Promise((resolve, reject) => {
      function handleChange({
        provider,
        providerType,
        address,
        chainId,
        isConnected
      }) {
        if (provider && isConnected) {
          resolve(provider)
        }
      }
      modal.subscribeProvider(handleChange)
    })
    return provider
  } catch (e) {
    if (e !== 'Modal closed by user') {
      throw e
    }
  }
}

export async function disconnect() {
  try {
    await modal.disconnect()
  } catch (e) {
    console.error('error disconnecting', e)
  }

  await setupENS({
    customProvider: rpcUrl,
    reloadOnAccountsChange: false,
    enforceReadOnly: true,
    enforceReload: false
  })
  isReadOnlyReactive(isReadOnly())
  web3ProviderReactive(null)
  networkIdReactive(null)
  networkReactive(null)

  // if (web3Modal) {
  //   await web3Modal.clearCachedProvider()
  // }
  // // Disconnect wallet connect provider
  // if (provider && provider.disconnect) {
  //   provider.disconnect()
  // }
  // await setupENS({
  //   customProvider: rpcUrl,
  //   reloadOnAccountsChange: false,
  //   enforceReadOnly: true,
  //   enforceReload: false
  // })
  // isReadOnlyReactive(isReadOnly())
  // web3ProviderReactive(null)
  // networkIdReactive(null)
  // networkReactive(null)
  // // networkIdReactive(await getNetworkId())
  // // networkReactive(await getNetwork())
}

export function setWeb3Modal() {}
