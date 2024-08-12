import { Link } from "react-router-dom";
import { useState } from "react";
import DropdownWallet from "./DropdownWallet";

type WalletButtonSectionProps = {
  customConnectWalletButtonColors?: {
    hoverThemedBackgroundColor: string;
  };
};

const WalletButtonSection: React.FC<WalletButtonSectionProps> = ({
  customConnectWalletButtonColors,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectWalletBackgroundColor, setConnectWalletBackgroundColor] =
    useState("#11101B");

  const handleMouseEnter = () => {
    if (window.scrollY > 0) {
      setConnectWalletBackgroundColor("#04030F");
    } else {
      setConnectWalletBackgroundColor(
        customConnectWalletButtonColors?.hoverThemedBackgroundColor || "#C496FF"
      );
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
            <Link to="/my-domains" className="link-default text-nowrap">
              My Domains
            </Link>
            <span className="bg-surfaceBrandLavender rounded-2xl text-textInverse text-xs p-xxs text-center min-w-[28px]">
              3
            </span>
          </div>
          <DropdownWallet />
        </>
      ) : (
        connectWalletButton
      )}
    </div>
  );
};

export default WalletButtonSection;
