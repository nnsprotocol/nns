import { Address, formatUnits } from "viem";

export function formatAddress(address?: Address) {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 5)}...${address.slice(-4)}`.toLowerCase();
}

export function formatUSD(v: bigint) {
  const value = parseFloat(formatUnits(v, 18));
  return "$" + Math.round(value);
}

export function formatETH(v: bigint) {
  const value = parseFloat(formatUnits(v, 18));
  return value.toFixed(5) + " ETH";
}

export function formatNOGS(v: bigint) {
  const value = parseFloat(formatUnits(v, 18));
  const fractionDigits = value < 1 && value !== 0 ? 5 : 0;
  return value.toFixed(fractionDigits) + " $NOGS";
}