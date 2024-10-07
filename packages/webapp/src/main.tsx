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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import ReferralProvider from "./utils/Referral";

// Sentry.init({
//   dsn: "https://79e15b51ee52260f821b2ff23d16bd9f@o4508065305985024.ingest.us.sentry.io/4508065312014336",
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.browserProfilingIntegration(),
//     Sentry.replayIntegration(),
//   ],
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });

// @ts-expect-error: allow BigInt to be serialized
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
          <ReferralProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools />
          </ReferralProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
