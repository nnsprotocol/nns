import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Root from "./Root.tsx";
import BuyDomainPage from "./pages/BuyDomainPage.tsx";
import CollectionDetailsPage from "./pages/CollectionDetailsPage.tsx";
import MyDomainsPage from "./pages/MyDomainsPage.tsx";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

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
        path: "/collection-details/:collectionId",
        element: <CollectionDetailsPage />,
      },
      {
        path: "/my-domains",
        element: <MyDomainsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
