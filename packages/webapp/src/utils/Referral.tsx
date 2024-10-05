import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, isAddress, zeroAddress } from "viem";

const LS_KEY = "nns:referrer";

const ReferralContext = createContext<Address>(zeroAddress);

export function useReferral() {
  return useContext(ReferralContext);
}

export function generateReferralLink(address: Address) {
  return `${window.location.origin}?ref=${address.toLowerCase()}`;
}

function isValid(address?: string | null): address is Address {
  return !!address && isAddress(address);
}

export default function ReferralProvider(props: PropsWithChildren) {
  const [referrer, setReferrer] = useState<Address>(zeroAddress);

  useEffect(() => {
    const storedReferrer = localStorage.getItem(LS_KEY);
    if (isValid(storedReferrer)) {
      setReferrer(storedReferrer);
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (isValid(ref)) {
      localStorage.setItem(LS_KEY, ref);
      setReferrer(ref);
    }
  }, [window.location.search]);

  return (
    <ReferralContext.Provider value={referrer}>
      {props.children}
    </ReferralContext.Provider>
  );
}
