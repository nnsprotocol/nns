import { useEffect, useState } from "react";
import { Hex, TransactionExecutionError, UserRejectedRequestError } from "viem";
import {
  Config,
  useWaitForTransactionReceipt,
  useWriteContract,
  UseWriteContractReturnType,
} from "wagmi";

export type TxState =
  | { value: "idle" }
  | { value: "signing"; hash: Hex }
  | { value: "minting"; hash: Hex }
  | { value: "success"; hash: Hex }
  | { value: "error"; error: Error & { shortMessage?: string }; hash?: Hex };

interface WriteContractWithServerRequestResponse {
  state: TxState;
  isLoading: boolean;
  writeContract: UseWriteContractReturnType<Config, unknown>["writeContract"];
  reset: () => void;
}

export function useWriteContractWaitingForTx(): WriteContractWithServerRequestResponse {
  const write = useWriteContract();
  const tx = useWaitForTransactionReceipt({ hash: write.data });

  const [state, setState] = useState<TxState>({ value: "idle" });

  useEffect(() => {
    if (tx.isLoading) {
      setState({ value: "minting", hash: write.data! });
    } else if (tx.isSuccess) {
      setState({ value: "success", hash: write.data! });
    } else if (tx.error) {
      setState({ value: "error", error: tx.error, hash: write.data });
    } else if (write.error && isUserRejectedRequestError(write.error)) {
      setState({ value: "idle" });
    } else if (write.error) {
      setState({ value: "error", error: write.error, hash: write.data });
    } else if (write.isPending) {
      setState({ value: "signing", hash: write.data! });
    } else {
      setState({ value: "idle" });
    }
  }, [
    write.data,
    tx.isLoading,
    tx.isSuccess,
    tx.error,
    write.error,
    write.isPending,
  ]);
  return {
    state,
    isLoading: ["signing", "minting"].includes(state.value),
    writeContract: write.writeContract,
    reset: write.reset,
  };
}

function isUserRejectedRequestError(e: Error): boolean {
  return (
    e instanceof UserRejectedRequestError ||
    (e instanceof TransactionExecutionError &&
      e.cause instanceof UserRejectedRequestError)
  );
}
