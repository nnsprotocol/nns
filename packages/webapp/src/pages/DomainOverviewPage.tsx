import { useParams } from "react-router-dom";
import LayoutDefault from "../components/layouts/LayoutDefault";
import GroupSocialLinks from "../components/ui/groups/GroupSocialLinks";
import IconChevronUp from "../components/icons/IconChevronUp";
import { useMemo, useState } from "react";
import { DomainCheckoutType, DomainData } from "../types/domain";
import DomainCheckoutOverview from "../components/domain-overview/DomainCheckoutOverview";
import DomainCheckoutConnectToWallet from "../components/domain-overview/DomainCheckoutСonnectToWallet";
import DomainCheckoutBuy from "../components/domain-overview/DomainCheckoutBuy";
import DomainCheckoutTransactionSubmitted from "../components/domain-overview/DomainCheckoutTransactionSubmitted";
import DomainCheckoutTransactionComplete from "../components/domain-overview/DomainCheckoutTransactionComplete";

function DomainOverviewPage() {
  const [domainCheckoutType, setDomainCheckoutType] = useState<DomainCheckoutType>("overview");
  const [domainAsPrimaryName, setDomainAsPrimaryName] = useState(true);

  const { domainId } = useParams<{ domainId: string }>();

  const domainData = useMemo<DomainData>(() => ({
    name: domainId,
    isAvailable: Boolean(domainId?.includes("bob")),
  }), [domainId]);

  const changeDomainCheckoutType = () => {
    switch (domainCheckoutType) {
      case "overview":
        setDomainCheckoutType("connectToWallet");
        break;
      case "connectToWallet":
        setDomainCheckoutType("buy");
        break;
      case "buy":
        setDomainCheckoutType("transactionSubmitted");
        break;
      case "transactionSubmitted":
        setDomainCheckoutType("transactionComplete");
        break;

      default:
        break;
    }
  };

  return (
    <LayoutDefault>
      <div className="flex flex-col justify-center items-center lg:items-start gap-lg lg:flex-row lg:gap-3.5xl mt-7 md:mt-14">
        <div className="w-full lg:max-w-[692px] grid grid-cols-1 gap-2xl">
          <div>
            <p className="text-base font-medium text-textBrandAquamarine mb-xs">
              Now Registering
            </p>
            <h1 className="text-6.5xl font-semibold text-textInverse mb-sm">
              {domainData.name}
            </h1>
            <div className="flex items-center gap-xxs">
              <img
                src={
                  domainData.isAvailable
                    ? "/badges/available-md.svg"
                    : "/badges/unavailable-md.svg"
                }
                className="h-[30px] w-auto"
                alt=""
              />
              <p className="text-base text-textSecondary font-medium">
                • Popular names are more expensive
              </p>
            </div>
          </div>
          <div className="p-lg border border-borderPrimary rounded-32 relative bg-cardPrimaryGradient">
            <div className="absolute inset-0 backdrop-blur-[8px] rounded-32 z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-xs mb-xl">
                <p className="text-xs font-medium text-textInverse uppercase">
                  About
                </p>
                <GroupSocialLinks
                  customLinkClassName="button-md py-0 px-1 flex items-center justify-center"
                  iconSize={16}
                />
              </div>
              <div className="grid grid-cols-1 gap-md">
                <div>
                  <div className="my-6 flex justify-center">
                    <img src="/temp/nns.svg" width={72} height={72} alt="" />
                  </div>
                  <p className="text-2xl font-semibold my-1 text-center">NNS</p>
                </div>
                <p className="text-base text-textSecondary text-center">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md bg-surfaceSecondary rounded-2xl p-md mt-xs">
                  <div className="flex flex-col items-start justify-center gap-sm">
                    <p className="text-sm text-textSecondary font-medium">
                      Registered Domains
                    </p>
                    <p className="text-2xl text-textInverse font-medium">
                      1,234
                    </p>
                    <div className="flex gap-xxs items-center">
                      <IconChevronUp />
                      <span className="text-xs text-textSecondary font-medium">
                        <span className="text-[#19BB46]">2.45% </span>Past Week
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-center gap-sm">
                    <p className="text-sm text-textSecondary font-medium">
                      Unique Owners
                    </p>
                    <p className="text-2xl text-textInverse font-medium">879</p>
                    <div className="flex gap-xxs items-center">
                      <IconChevronUp />
                      <span className="text-xs text-textSecondary font-medium">
                        <span className="text-[#19BB46]">1.08% </span>Past Week
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[383px]">
          {domainCheckoutType === "overview" && (
            <DomainCheckoutOverview
              changeDomainCheckoutType={changeDomainCheckoutType}
              domainData={domainData}
              domainAsPrimaryNameToggle={{
                domainAsPrimaryName,
                setDomainAsPrimaryName,
              }}
            />
          )}
          {domainCheckoutType === "connectToWallet" && (
            <DomainCheckoutConnectToWallet
              changeDomainCheckoutType={changeDomainCheckoutType}
              domainData={domainData}
              domainAsPrimaryNameToggle={{
                domainAsPrimaryName,
                setDomainAsPrimaryName,
              }}
            />
          )}
          {domainCheckoutType === "buy" && (
            <DomainCheckoutBuy
              changeDomainCheckoutType={changeDomainCheckoutType}
              domainData={domainData}
              domainAsPrimaryNameToggle={{
                domainAsPrimaryName,
                setDomainAsPrimaryName,
              }}
            />
          )}
          {domainCheckoutType === "transactionSubmitted" && (
            <DomainCheckoutTransactionSubmitted
              changeDomainCheckoutType={changeDomainCheckoutType}
              domainData={domainData}
            />
          )}
          {domainCheckoutType === "transactionComplete" && (
            <DomainCheckoutTransactionComplete
              changeDomainCheckoutType={changeDomainCheckoutType}
              domainData={domainData}
            />
          )}
        </div>
      </div>
    </LayoutDefault>
  );
}

export default DomainOverviewPage;
