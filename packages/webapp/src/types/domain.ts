export type DomainCheckoutType =
  | "overview"
  | "connectToWallet"
  | "buy"
  | "transactionSubmitted"
  | "transactionComplete";

export type DomainData = {
  name?: string;
  isAvailable: boolean;
}
