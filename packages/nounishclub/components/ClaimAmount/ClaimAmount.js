import { useEthers } from "@usedapp/core";
import { useNumberOfClaims } from "../../hooks/hooks";

const ClaimAmount = () => {
  const { account } = useEthers();
  const claims = useNumberOfClaims(account);

  const isLoading = typeof claims !== "number";

  return <h6>{isLoading ? "Loading..." : `Claims available: ${claims}`}</h6>;
};

export default ClaimAmount;
