import { Link } from "react-router-dom";
import IconChevronUp from "../icons/IconChevronUp";
import { useState } from "react";

type WalletButtonSectionProps = {
  customConnectWalletButtonColors?: {
    hoverThemedBackgroundColor: string;
  };
}

const WalletButtonSection: React.FC<WalletButtonSectionProps> = ({ customConnectWalletButtonColors }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectWalletBackgroundColor, setConnectWalletBackgroundColor] = useState("#11101B");

  const handleMouseEnter = () => {
    if (window.scrollY > 0) {
      setConnectWalletBackgroundColor("#04030F");
    } else {
      setConnectWalletBackgroundColor(customConnectWalletButtonColors?.hoverThemedBackgroundColor || "#C496FF");
    }
  };

  const handleMouseLeave = () => {
    setConnectWalletBackgroundColor("#11101B");
  };

  const connectWalletButton = customConnectWalletButtonColors ? (
    <button
      type="button"
      className="button-secondary button-md"
      style={{ backgroundColor: connectWalletBackgroundColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsConnected(true)}
    >
      Connect Wallet
    </button>
  ) : (
    <button
      id="connect-wallet-button"
      type="button"
      onClick={() => setIsConnected(true)}
      className="button-secondary button-md border-borderSecondary"
    >
      Connect Wallet
    </button>
  );

  return (
    <div className="flex items-center gap-md">
      {isConnected ? (
        <>
          <div className="hidden sm:flex items-center gap-xs">
            <Link to="/my-domains" className="link-default">
              My Domains
            </Link>
            <span className="bg-surfaceBrandLavender rounded-2xl text-textInverse text-xs p-xxs text-center min-w-[28px]">
              3
            </span>
          </div>
          <button
            id="dropdown-wallet-button"
            type="button"
            className="bg-gradient-to-b from-surfaceBrandLavender from-30% to-surfaceBrandMauve p-[1px] rounded-xl"
          >
            <div className="bg-surfacePrimary rounded-xl p-sm flex items-center gap-xxs">
              <img src="/temp/profile.png" width={16} height={16} alt="" />
              <span className="hidden sm:block text-[#FBFFF4] text-sm font-medium">
                0x123...c5f6
              </span>
              <span className="stroke-[#FBFFF4] rotate-180">
                <IconChevronUp />
              </span>
            </div>
          </button>
        </>
      ) : (
        connectWalletButton
      )}
    </div>
  );
};

export default WalletButtonSection;
