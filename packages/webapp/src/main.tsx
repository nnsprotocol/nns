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

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

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
        path: "/domain-overview/:domainId",
        element: <DomainOverviewPage />,
      },
      {
        path: "/my-domains",
        element: <MyDomainsPage />,
      },
      {
        path: "/collection-details/:collectionId",
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
