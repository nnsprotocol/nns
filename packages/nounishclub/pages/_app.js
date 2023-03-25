import "@/styles/globals.scss";

import { DAppProvider, Goerli, Mainnet } from "@usedapp/core";
import { AlchemyProvider } from "@ethersproject/providers";

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: new AlchemyProvider(
      "homestead",
      "FzSjc5hFAWuIEOAAlPXK8tDYBESIw7ot"
    ),
    [Goerli.chainId]: new AlchemyProvider(
      "goerli",
      "bsy0xrzYg_ZIdoX9qVmi5n6XkUtDYaLA"
    ),
  },
};

export default function App({ Component, pageProps }) {
  return (
    <DAppProvider config={config}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}
