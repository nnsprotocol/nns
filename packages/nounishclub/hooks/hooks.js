const { useMemo } = require("react");
const { useEthers, useCall, useContractFunction } = require("@usedapp/core");
const { contracts, resolvers } = require("../contracts/controller");

// useNumberOfClaims returns the number of avilable claims for the current account.
function useNumberOfClaims(address) {
  const { chainId } = useEthers();
  const contract = contracts[chainId];
  // useMemo is needed as we need to cache the current timestamp
  // until the address or the chain changes. This is needed to avoid an
  // infinite refresh.
  const timestamp = useMemo(() => Date.now(), [address, chainId]);
  const { value, error } =
    useCall(
      address &&
        !!contract && {
          contract,
          method: "claimsCount",
          args: [address, timestamp],
        }
    ) || {};
  if (error) {
    console.error(error.message);
    return undefined;
  }
  return value ? parseInt(value.toString()) : undefined;
}

function useClaimName() {
  const { chainId, account } = useEthers();

  const contract = contracts[chainId];

  const { state, send, events } = useContractFunction(contract, "register", {
    transactionName: "Register",
    chainId: chainId,
  });

  const registeredName =
    state.status === "Success" ? events?.[0]?.args[0] : null;
  const isLoading = ["Mining"].includes(state.status);
  const error = state.errorMessage;
  const errorCode = state.errorCode;

  return {
    isLoading,
    send: () => send(resolvers[chainId], account),
    error,
    registeredName,
    errorCode,
  };
}

module.exports = { useNumberOfClaims, useClaimName };
