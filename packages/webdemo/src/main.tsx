import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useColorScheme } from "@mantine/hooks";

// this is needed to make react-query-devtools work
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const config = getDefaultConfig({
  appName: "NNS v2",
  projectId: "123",
  chains: [baseSepolia],
  ssr: false,
});

const theme = createTheme({});
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Root />
    </MantineProvider>
  </React.StrictMode>
);

function Root() {
  const scheme = useColorScheme();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={scheme == "dark" ? darkTheme() : lightTheme()}
        >
          <App />
          <ReactQueryDevtools initialIsOpen={true} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
