import { DAppProvider, Goerli, Mainnet } from "@usedapp/core";
import "bootstrap/dist/css/bootstrap.min.css";
import { getDefaultProvider, providers } from "ethers";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ScreenFixedProvider from "../src/Components/context/ScreenFixedProvider";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: new providers.AlchemyProvider(
      "homestead",
      "FzSjc5hFAWuIEOAAlPXK8tDYBESIw7ot"
    ),
    [Goerli.chainId]: new providers.AlchemyProvider(
      "goerli",
      "FzSjc5hFAWuIEOAAlPXK8tDYBESIw7ot"
    ),
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ScreenFixedProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ScreenFixedProvider>
    </DAppProvider>
  </React.StrictMode>
);

reportWebVitals();
