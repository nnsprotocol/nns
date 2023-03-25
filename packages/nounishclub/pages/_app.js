import "@/styles/globals.scss";

import { DAppProvider, Goerli, Mainnet } from "@usedapp/core";

const config = {
  networks: [Goerli, Mainnet],
};

export default function App({ Component, pageProps }) {
  return (
    <DAppProvider config={config}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}
