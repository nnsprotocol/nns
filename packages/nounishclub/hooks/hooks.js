import { useEffect, useState, useCallback } from "react";
import { useEthers, useContractFunction, Goerli, Mainnet } from "@usedapp/core";
import config from "../network";

async function fetchClaims(chainId, account) {
  const baseURL = config[chainId]?.apiURL;
  if (!baseURL) {
    return null;
  }
  const req = await fetch(`${baseURL}/claims/${account}`);
  const body = await req.json();
  return body.num_claims;
}

async function createClaims(chainId, account) {
  const baseURL = config[chainId]?.apiURL;
  if (!baseURL) {
    return null;
  }
  const res = await fetch(`${baseURL}/claims`, {
    method: "POST",
    body: JSON.stringify({ sender: account, address: account }),
  });
  switch (res.status) {
    case 200:
      return await res.json();
    case 404:
      return null;
    default:
      throw new Error(`invalid status ${res.status}`);
  }
}

// useNumberOfClaims returns the number of avilable claims for the current account or null when no wallet is connected.
function useNumberOfClaims() {
  const { chainId, account } = useEthers();
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    if (!account || !chainId) {
      setClaims(null);
      return;
    }

    fetchClaims(chainId, account)
      .then((claims) => setClaims(claims))
      .catch((err) => {
        console.error(err);
        setClaims(null);
      });
  }, [account, chainId]);

  return claims;
}

function useClaimName() {
  const { chainId, account } = useEthers();
  const [noClaims, setNoClaims] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const createOpenseaURL = config[chainId]?.openseaURL;
  const { state, send, events } = useContractFunction(
    config[chainId]?.controller,
    "register",
    {
      transactionName: "Register",
      chainId: chainId,
    }
  );

  const createClaimAndSend = useCallback(() => {
    if (!account || !chainId) {
      return;
    }

    setImageURL(null);
    setNoClaims(null);
    createClaims(chainId, account).then((claim) => {
      setNoClaims(!claim);
      if (claim) {
        setImageURL(claim.image_url);
        send(
          claim.number,
          claim.nonce,
          claim.expiry,
          claim.resolver,
          claim.address,
          claim.signature
        );
      }
    });
  }, [chainId, account]);

  const registeredName =
    state.status === "Success" ? events?.[0]?.args[0] : null;
  const tokenId = state.status === "Success" ? events?.[0]?.args[1] : null;
  const isLoading = ["Mining"].includes(state.status);
  const errorCode = state.errorCode;

  const openseaURL = tokenId ? createOpenseaURL(tokenId) : null;

  return {
    send: createClaimAndSend,
    isLoading,
    registeredName,
    errorCode,
    noClaims,
    imageURL,
    openseaURL,
  };
}

module.exports = {
  useNumberOfClaims,
  useClaimName,
};
