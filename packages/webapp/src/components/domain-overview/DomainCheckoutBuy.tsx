import { DomainData } from "../../types/domain";
import IconArrowRight from "../icons/IconArrowRight";
import IconInfo from "../icons/IconInfo";
import ToggleDefault from "../ui/inputs/ToggleDefault";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

const DomainCheckoutBuy: React.FC<{
  changeDomainCheckoutType: () => void;
  domainData: DomainData;
  domainAsPrimaryNameToggle: {
    domainAsPrimaryName: boolean;
    setDomainAsPrimaryName: React.Dispatch<React.SetStateAction<boolean>>;
  };
}> = ({ domainData, changeDomainCheckoutType, domainAsPrimaryNameToggle }) => {
  const handleConnectWalletButtonClick = () => {
    if (!domainData.isAvailable) {
      return;
    }
    changeDomainCheckoutType();
  };

  return (
    <DomainCheckoutContainer>
      <div>
        <div className="px-md pb-md border-b border-borderLight grid grid-cols-1 gap-lg">
          <div className="flex gap-xxs justify-center items-center">
            <img
              src="/brand/coin-hand.svg"
              width={64}
              height={64}
              alt="Coin hand"
              className="rounded-full"
            />
          </div>
          <p className="text-sm text-textSecondary font-medium text-center">
            Buy domain
          </p>
        </div>
        <div className="text-textSecondary grid grid-cols-1 px-md">
          <div className="py-md">
            <p className="text-sm font-medium mb-sm">You Pay</p>
            <div className="flex gap-md justify-between items-center mb-sm">
              <span className="text-2xl text-textPrimary font-medium">
                0.1 ETH
              </span>
              <img src="/temp/ether-coin.svg" width={25} height={25} />
            </div>
            <div className="flex gap-md justify-between items-center">
              <span className="text-sm text-textSecondary font-medium">
                $100.34
              </span>
              <span className="text-sm text-textSecondary font-medium">
                Balance: 2.14 ETH
              </span>
            </div>
          </div>
          <div className="border-t border-borderLight py-md">
            <p className="text-sm font-medium mb-sm">You Get</p>
            <div className="flex gap-md pb-md">
              <div>
                <img
                  src="/temp/domain-card.png"
                  width={52}
                  height={52}
                  alt=""
                  className="rounded-lg object-contain bg-surfaceSecondary/10"
                />
              </div>
              <div className="flex flex-col gap-xs justify-center">
                <p className="text-2xl text-textPrimary font-medium">
                  {domainData.name}
                </p>
                <p className="text-sm font-normal text-textSecondary">
                  NNS Domain
                </p>
              </div>
            </div>
            <div className="bg-surfacePinkGradient py-xs px-sm rounded-2xl relative">
              <div className="absolute left-0 top-0 bottom-[8px] right-[10px] rounded-2xl z-0 bg-[url('/brand/coins.svg')] bg-no-repeat bg-right"></div>
              <div className="grid grid-cols-1 max-w-[75%] gap-xs relative z-10">
                <p className="text-base text-textInverse font-medium">
                  Earn while holding
                </p>
                <p className="text-base text-[#FC76C3] font-medium">
                  3M NOGS distributed to holders periodically
                </p>
                <a href="#" className="link-default">
                  <IconArrowRight />
                  <span>Discover More</span>
                  <IconArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-textSecondary grid grid-cols-1 gap-md p-md border-t border-borderLight">
          <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Gas Fees</p>
            <div>
              <p className="font-medium text-textPrimary text-end mb-xs">
                $13.28
              </p>
              <p className="font-normal text-end">0.004 ETH</p>
            </div>
          </div>
          <div className="flex gap-xs justify-between">
            <p className="flex gap-xxs items-center text-sm font-medium">
              <span>Set as primary name</span> <IconInfo />
            </p>
            <ToggleDefault
              isOn={domainAsPrimaryNameToggle.domainAsPrimaryName}
              setIsOn={domainAsPrimaryNameToggle.setDomainAsPrimaryName}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-xs px-md">
          <button
            type="button"
            className="button-brand-lavender button-lg justify-center rounded-2xl"
            onClick={handleConnectWalletButtonClick}
          >
            Buy Domain
          </button>
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutBuy;
