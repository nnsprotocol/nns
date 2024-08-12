import { Link } from "react-router-dom";
import IconChevronUp from "../icons/IconChevronUp";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const DropdownWallet: React.FC = () => {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <li>
          <Link
            to="/my-domains"
            className="text-sm text-textInverse text-nowrap flex items-center gap-xs font-medium"
          >
            <span>My Domains</span>
            <span className="bg-surfaceBrandLavender rounded-2xl text-textInverse text-xs p-xxs text-center min-w-[28px]">
              3
            </span>
          </Link>
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
          <img src="/temp/profile.png" width={16} height={16} alt="" />
          <span className="hidden sm:block text-[#FBFFF4] text-sm font-medium">
            0x123...c5f6
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

export default DropdownWallet;
