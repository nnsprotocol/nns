import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import DropdownWallet from "./DropdownWallet";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useNumberOfDomains } from "../../services/graph";

type WalletButtonSectionProps = {
  switchColors?: boolean;
  customConnectWalletButtonColors?: {
    hoverThemedBackgroundColor: string;
  };
};

const WalletButtonSection: React.FC<WalletButtonSectionProps> = ({
  customConnectWalletButtonColors,
  switchColors,
}) => {
  const account = useAccount();
  const [isContentUnderHeader, setIsContentUnderHeader] = useState(false);
  const { openConnectModal } = useConnectModal();
  const [connectWalletBackgroundColor, setConnectWalletBackgroundColor] =
    useState("#11101B");
  const numOfDomains = useNumberOfDomains({
    owner: account.address,
  });

  const handleScroll = useCallback(() => {
    setIsContentUnderHeader(window.scrollY >= 40);
  }, []);

  useEffect(() => {
    if (!switchColors) {
      return;
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, switchColors]);

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
      onClick={() => openConnectModal?.()}
    >
      Connect Wallet
    </button>
  ) : (
    <button
      id="connect-wallet-button"
      type="button"
      onClick={() => openConnectModal?.()}
      className="button-secondary button-md border-borderSecondary"
    >
      Connect Wallet
    </button>
  );

  return (
    <div className="flex items-center gap-md">
      {account.isConnected ? (
        <>
          <div className="hidden sm:flex items-center gap-xs">
            <Link
              to="/account"
              className={
                isContentUnderHeader || !switchColors
                  ? "link-brand-lavender transition-colors text-nowrap"
                  : "link-default transition-colors text-nowrap"
              }
            >
              My Names
            </Link>
            {numOfDomains.data && (
              <span
                className={`rounded-2xl text-xs p-xxs text-center min-w-[28px] text-textInverse ${
                  isContentUnderHeader || !switchColors
                    ? "bg-surfaceBrandLavender"
                    : "bg-surfacePrimary"
                }`}
              >
                {numOfDomains.data || ""}
              </span>
            )}
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
