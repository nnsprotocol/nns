import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import { useNumberOfDomains } from "../../services/graph";
import { useResolvedName } from "../../services/resolver";
import IconChevronUp from "../icons/IconChevronUp";

const DropdownWallet: React.FC = () => {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const name = useResolvedName({ account: account.address });
  const numDomains = useNumberOfDomains({ owner: account.address });

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    setIsDropdownVisible(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownContentSection = (
    <div className="absolute top-100 right-0 py-1 z-30">
      <ul className="rounded-3xl border border-borderPrimary bg-surfacePrimary p-md">
        <li className="p-3">
          <Link
            to="/account"
            className="text-sm text-textInverse text-nowrap flex items-center gap-xs font-medium"
          >
            <span>My Domains</span>
            <span className="bg-surfaceBrandLavender rounded-2xl text-textInverse text-xs p-xxs text-center min-w-[28px]">
              {numDomains.data || ""}
            </span>
          </Link>
        </li>
        <li className="p-3">
          <button
            className="text-sm text-textInverse text-nowrap flex items-center gap-xs font-medium"
            onClick={() => disconnect()}
          >
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="dropdown-wallet-button"
        type="button"
        className="bg-gradient-to-b from-surfaceBrandLavender from-30% to-surfaceBrandMauve p-[1px] rounded-xl"
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <div className="bg-surfacePrimary rounded-xl p-sm pe-5 min-w-[50px] flex items-center justify-between gap-xxs">
          {/* <img src="/temp/profile.png" width={16} height={16} alt="" /> */}
          <span className="hidden sm:block text-[#FBFFF4] text-sm font-medium">
            {name.data || formatAddress(account.address)}
          </span>
          <div>
            <div
              className={`stroke-[#FBFFF4] transition-all ${
                isDropdownVisible ? "" : "rotate-180"
              }`}
            >
              <IconChevronUp />
            </div>
          </div>
        </div>
      </button>
      {isDropdownVisible && dropdownContentSection}
    </div>
  );
};

function formatAddress(address?: Address) {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 5)}...${address.slice(-4)}`.toLowerCase();
}

export default DropdownWallet;
