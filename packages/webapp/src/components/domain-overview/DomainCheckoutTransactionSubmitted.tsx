import { useEffect } from "react";
import { DomainData } from "../../types/domains";
import IconArrowRight from "../icons/IconArrowRight";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

const DomainCheckoutTransactionSubmitted: React.FC<{
  changeDomainCheckoutType: () => void;
  domainData: DomainData;
}> = ({ domainData, changeDomainCheckoutType }) => {

  useEffect(() => {
    const id = setTimeout(() => {
      changeDomainCheckoutType()
    }, 3000);

    return () => clearTimeout(id)
  }, [])

  return (
    <DomainCheckoutContainer>
      <div>
        <div className="px-md pb-md border-b border-borderLight grid grid-cols-1 gap-lg">
          <div className="flex gap-xxs justify-center items-center">
            <div className="relative h-[74px] w-[74px] flex items-center justify-center">
              <img
                src="/brand/coin-hand.svg"
                width={64}
                height={64}
                alt="Coin hand"
                className="rounded-full relative z-0 flex pt-[1px] pl-[2px]"
              />
              <img
                src="/brand/checkout-spinner.png"
                width={74}
                height={74}
                alt="Spinner"
                className="absolute inset-0 z-10 animate-spin w-[74px] h-[74px]"
              />
            </div>
          </div>
          <p className="text-sm text-textSecondary font-medium text-center">
            Transaction submitted
          </p>
        </div>
        <div className="py-xl">
          <p className="text-sm text-textSecondary font-medium text-center mb-md">
            Purchasing
          </p>
          <div className="flex flex-col items-center gap-md">
            <div>
              <img
                src="/temp/domain-card.png"
                width={100}
                height={100}
                alt=""
                className="rounded-2xl object-contain bg-surfaceSecondary/10"
              />
            </div>
            <div className="flex flex-col text-center">
              <p className="text-2xl text-textPrimary mb-xs font-medium">
                {domainData.name}
              </p>
              <p className="text-sm font-medium text-textSecondary">
                NNS Domain
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-md border-t border-borderLight">
          <a href="#" target="_blank" className="link-brand-lavender">
            <span>View Etherscan</span>
            <IconArrowRight />
          </a>
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutTransactionSubmitted;
