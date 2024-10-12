import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BaseError, Hex, UserRejectedRequestError } from "viem";
import {
  Config,
  useSignMessage,
  useWaitForTransactionReceipt,
  useWriteContract,
  UseWriteContractReturnType,
} from "wagmi";

export type TxState =
  | { value: "idle"; userCanceled?: boolean }
  | { value: "signing"; hash: Hex }
  | { value: "minting"; hash: Hex }
  | { value: "success"; hash: Hex }
  | { value: "error"; error: Error; formattedError: string; hash?: Hex };

interface WriteContractWaitingForTxResponse {
  state: TxState;
  isLoading: boolean;
  writeContract: UseWriteContractReturnType<Config, unknown>["writeContract"];
  reset: () => void;
}

interface WriteContractWaitingForTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useWriteContractWaitingForTx(
  props?: WriteContractWaitingForTxOptions
): WriteContractWaitingForTxResponse {
  const write = useWriteContract();
  const tx = useWaitForTransactionReceipt({ hash: write.data });

  const [state, setState] = useState<TxState>({ value: "idle" });

  const { onError, onSuccess } = props || {};
  useEffect(() => {
    if (tx.isLoading) {
      setState({ value: "minting", hash: write.data! });
    } else if (tx.isSuccess) {
      setState({ value: "success", hash: write.data! });
      onSuccess?.();
    } else if (tx.error) {
      setState({
        value: "error",
        error: tx.error,
        hash: write.data,
        formattedError: formatError(tx.error),
      });
      onError?.(tx.error);
    } else if (write.error && isUserRejectedRequestError(write.error)) {
      setState({ value: "idle", userCanceled: true });
    } else if (write.error) {
      setState({
        value: "error",
        error: write.error,
        hash: write.data,
        formattedError: formatError(write.error),
      });
      onError?.(write.error);
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
    onError,
    onSuccess,
  ]);
  return {
    state,
    isLoading: ["signing", "minting"].includes(state.value),
    writeContract: write.writeContract,
    reset: write.reset,
  };
}

type TxWithServerState = TxState | { value: "loading" };
interface Props<serverData> {
  fetchServerData: () => Promise<serverData>;
  startTransaction(
    serverData: serverData,
    write: UseWriteContractReturnType<Config, unknown>["writeContract"]
  ): void;
  enabled?: boolean;
}

export interface WriteContractWithServerRequestResponse {
  state: TxWithServerState;
  write: () => void;
  reset: () => void;
}

export function useWriteContractWithServerRequest<serverData>(
  props: Props<serverData>
): WriteContractWithServerRequestResponse {
  const write = useWriteContract();
  const tx = useWaitForTransactionReceipt({ hash: write.data });
  const serverData = useMutation({
    mutationFn: props.fetchServerData,
    onSuccess: (data) => {
      props.startTransaction(data, write.writeContract);
    },
  });

  const [state, setState] = useState<TxWithServerState>({ value: "idle" });

  useEffect(() => {
    if (serverData.isPending) {
      setState({ value: "loading" });
    } else if (serverData.error) {
      setState({
        value: "error",
        error: serverData.error,
        formattedError: formatError(serverData.error),
      });
    } else if (tx.isLoading) {
      setState({ value: "minting", hash: write.data! });
    } else if (tx.isSuccess) {
      setState({ value: "success", hash: write.data! });
    } else if (tx.error) {
      setState({
        value: "error",
        error: tx.error,
        hash: write.data,
        formattedError: formatError(tx.error),
      });
    } else if (write.error && isUserRejectedRequestError(write.error)) {
      setState({ value: "idle", userCanceled: true });
    } else if (write.error) {
      setState({
        value: "error",
        error: write.error,
        hash: write.data,
        formattedError: formatError(write.error),
      });
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
    serverData.isPending,
    serverData.error,
  ]);

  return {
    state,
    write: () => {
      const enabled = props.enabled ?? true;
      if (!enabled) {
        return;
      }
      serverData.mutate();
    },
    reset: () => {
      serverData.reset();
      write.reset();
    },
  };
}

type SignedMutationState<Result> =
  | { value: "idle" }
  | { value: "loading" }
  | { value: "signing" }
  | { value: "success"; data: Result }
  | { value: "error"; error: Error };

interface SignedProps<MutationRequest, MutationResult> {
  buildMessage(req: MutationRequest): string;
  serverMutation: (
    req: MutationRequest,
    signature: Hex
  ) => Promise<MutationResult>;
  enabled?: boolean;
  onSuccess?: () => void;
}

export function useSignedServerRequest<MutationRequest, MutationResult>(
  props: SignedProps<MutationRequest, MutationResult>
) {
  const serverMutation = useMutation({
    mutationFn: (d: { req: MutationRequest; signature: Hex }) =>
      props.serverMutation(d.req, d.signature),
    onSettled: props.onSuccess,
  });

  const sign = useSignMessage();
  const [state, setState] = useState<SignedMutationState<MutationResult>>({
    value: "idle",
  });

  useEffect(() => {
    if (serverMutation.isPending) {
      setState({ value: "loading" });
    } else if (serverMutation.error) {
      setState({ value: "error", error: serverMutation.error });
    } else if (serverMutation.isSuccess) {
      setState({ value: "success", data: serverMutation.data });
    } else if (sign.error && isUserRejectedRequestError(sign.error)) {
      setState({ value: "idle" });
    } else if (sign.error) {
      setState({ value: "error", error: sign.error });
    } else if (sign.isPending) {
      setState({ value: "signing" });
    } else {
      setState({ value: "idle" });
    }
  }, [
    sign.isPending,
    sign.error,
    serverMutation.isPending,
    serverMutation.error,
    serverMutation.isSuccess,
    serverMutation.data,
  ]);

  return {
    state,
    write: (req: MutationRequest) => {
      const enabled = props.enabled ?? true;
      if (!enabled) {
        return;
      }
      sign
        .signMessageAsync({
          message: props.buildMessage(req),
        })
        .then((signature) => {
          serverMutation.mutate(
            {
              req,
              signature,
            },
            {}
          );
        });
    },
    reset: () => {
      serverMutation.reset();
      sign.reset();
    },
  };
}

function isUserRejectedRequestError(e: Error): boolean {
  let error: Error | undefined = e;
  while (true) {
    if (!error) {
      return false;
    }

    if (error instanceof UserRejectedRequestError) {
      return true;
    }
    if ("cause" in error) {
      error = error.cause as Error;
    } else {
      return false;
    }
  }
}

function formatError(e: Error) {
  if (e instanceof BaseError) {
    return e.shortMessage || e.message;
  }
  return e.message;
}
