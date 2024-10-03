import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Root from "./Root.tsx";
import BuyDomainPage from "./pages/BuyDomainPage.tsx";
import CollectionDetailsPage from "./pages/CollectionDetailsPage.tsx";
import Demo from "./pages/Demo.tsx";
import DomainOverviewPage from "./pages/DomainOverviewPage.tsx";
import MyDomainsPage from "./pages/MyDomainsPage.tsx";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// @ts-ignore
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <BuyDomainPage />,
      },
      {
        path: "/domains/:domainName",
        element: <DomainOverviewPage />,
      },
      {
        path: "/account",
        element: <MyDomainsPage />,
      },
      {
        path: "/collections/:id",
        element: <CollectionDetailsPage />,
      },
      {
        path: "/demo",
        element: <Demo />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

const queryClient = new QueryClient();
const config = getDefaultConfig({
  appName: "NNS",
  projectId: "2b9721d85a7335f1bffd51b84a4ad573",
  chains: [baseSepolia],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
