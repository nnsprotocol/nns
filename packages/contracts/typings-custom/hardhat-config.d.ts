import 'hardhat/types/config'

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    tld: string
  }

  interface HttpNetworkUserConfig {
    ethRegistryAddress?: string
    usdOracleAddress?: string
  }

  interface HardhatNetworkUserConfig {
    ethRegistryAddress?: string
    usdOracleAddress?: string
  }
}