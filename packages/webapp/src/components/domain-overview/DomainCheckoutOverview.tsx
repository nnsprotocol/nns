import { DomainData } from "../../types/domain";
import IconArrowRight from "../icons/IconArrowRight";
import IconInfo from "../icons/IconInfo";
import ToggleDefault from "../ui/inputs/ToggleDefault";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

const DomainCheckoutOverview: React.FC<{
  changeDomainCheckoutType: () => void;
  domainData: DomainData;
  domainAsPrimaryNameToggle: {
    domainAsPrimaryName: boolean;
    setDomainAsPrimaryName: React.Dispatch<React.SetStateAction<boolean>>;
  };
}> = ({ domainData, changeDomainCheckoutType, domainAsPrimaryNameToggle }) => {

  const handleGetYourNameButtonClick = () => {
    if(!domainData.isAvailable) { return }
    changeDomainCheckoutType();
  };

  return (
    <DomainCheckoutContainer>
      <div className="px-md">
        <div className="flex gap-md pb-md">
          <div>
            <img
              src="/temp/domain-card.png"
              width={120}
              height={120}
              alt=""
              className="rounded-2xl object-contain bg-surfaceSecondary/10"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-2xl text-textPrimary mb-xs font-medium">
              {domainData.name}
            </p>
            <p className="text-sm font-normal text-textSecondary mb-xs">
              NNS Domain
            </p>
            <p className="text-2xl text-textBrandLavender mt-auto font-medium">
              $100
            </p>
          </div>
        </div>
        <div className="py-md flex items-center">
          <img
            src="/brand/domain-checkout-divider.svg"
            alt=""
            height={24}
            className="h-[24px] w-auto"
          />
        </div>
        <div className="mb-md text-textSecondary grid grid-cols-1 gap-md">
          <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Own for</p>
            <div>
              <p className="font-medium text-textPrimary text-end mb-xs">
                $100.00
              </p>
              <p className="font-normal text-end">0.03 ETH</p>
            </div>
          </div>
          <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Expiration Date</p>
            <div>
              <p className="font-medium text-textPrimary text-end mb-xs">
                18 Jun, 2025
              </p>
              <p className="font-normal text-end">1 Year</p>
            </div>
          </div>
          <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Est. Gas Fees</p>
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
        <div className="grid grid-cols-1 gap-xs">
          <button
            type="button"
            className="button-brand-lavender button-lg justify-center rounded-2xl"
            disabled={!domainData.isAvailable}
            onClick={handleGetYourNameButtonClick}
          >
            <span>Get your Name</span>
            <IconArrowRight />
          </button>
          <p className="text-textSecondary text-sm text-center">
            Your name is forever. Say goodbye to renewal fees!
          </p>
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutOverview;
