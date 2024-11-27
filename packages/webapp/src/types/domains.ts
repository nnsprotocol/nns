export type DomainItem = {
  id: string;
  imgSrc: string;
  name: string;
  rewards: string;
  expires: string;
  isPrimary: boolean;
  price: number;
}

export type DomainCollection = {
  id: string;
  name: string;
  imgSrc: string;
  isPreffered: boolean;
  resolvingAs: string;
  domains: DomainItem[];
};

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
