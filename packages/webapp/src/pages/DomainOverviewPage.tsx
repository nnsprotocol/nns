import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { namehash } from "viem";
import { normalize } from "viem/ens";
import { useAccount } from "wagmi";
import CONTROLLER_ABI from "../abi/IController";
import DomainCheckoutBuy from "../components/domain-overview/DomainCheckoutBuy";
import DomainCheckoutOverview from "../components/domain-overview/DomainCheckoutOverview";
import DomainCheckoutTransactionComplete from "../components/domain-overview/DomainCheckoutTransactionComplete";
import DomainCheckoutTransactionSubmitted from "../components/domain-overview/DomainCheckoutTransactionSubmitted";
import DomainCheckoutConnectToWallet from "../components/domain-overview/DomainCheckoutСonnectToWallet";
import LayoutDefault from "../components/layouts/LayoutDefault";
import { CONTROLLER_ADDRESS, useDomainPrice } from "../services/controller";
import { useRegistry } from "../services/graph";
import { useWriteContractWaitingForTx } from "../services/shared";
import { DomainCheckoutType } from "../types/domains";
import { useCollectionData } from "../components/collection-details/types";

/*
InvalidPricingOracle() 0x2715c316
CldAlreadyExists() 0x6e12e57b
UnauthorizedAccount() 0xa97ff08a
InvalidCld() 0x00ea4de6
InvalidLabel() 0x3d36cb8d
InsufficientTransferAmount(uint256,uint256) 0x5338e506
InvalidRegistrationPeriod() 0xddceada6
NonExpiringCld(uint256) 0x42cad659
CldAlreadyRegistered() 0xd36fe932
UnauthorizedAccount() 0xa97ff08a
InvalidCld() 0x00ea4de6
CldAlreadyRegistered(uint256) 0x8099d066
InvalidCld(uint256) 0x6128427d
InvalidAccount(address) 0x4b579b22
InvalidShares() 0x6edcc523
NothingToWithdraw() 0xd0d04f60
CallerNotController(address) 0x69867d64
*/

function DomainOverviewPage() {
  const [domainCheckoutType, setDomainCheckoutType] =
    useState<DomainCheckoutType>("overview");
  const [domainAsPrimaryName, setDomainAsPrimaryName] = useState(true);

  const account = useAccount();

  const navigate = useNavigate();
  const { domainName: domainFullName } = useParams<{ domainName: string }>();
  const [domainName, cldName] = useMemo(
    () => domainFullName?.split(".") || [],
    [domainFullName]
  );
  const cldId = useMemo(() => namehash(cldName), [cldName]);

  const registry = useRegistry({ id: cldId });
  const collectionData = useCollectionData(cldId);

  useEffect(() => {
    if (registry.isSuccess && !registry.data) {
      navigate("/");
    }
  }, [registry.isSuccess, registry.data]);

  const price = useDomainPrice({
    cldId,
    name: domainName,
  });

  const register = useWriteContractWaitingForTx();
  useEffect(() => {
    if (
      register.state.value === "idle" &&
      domainCheckoutType === "transactionSubmitted"
    ) {
      setDomainCheckoutType("buy");
    } else if (register.state.value === "success") {
      setDomainCheckoutType("transactionComplete");
    }
  }, [register.state.value]);

  const handleNextStep = useCallback(() => {
    if (domainCheckoutType === "overview" && account.isConnected) {
      setDomainCheckoutType("buy");
    } else if (domainCheckoutType === "overview" && !account.isConnected) {
      setDomainCheckoutType("connectToWallet");
    } else if (
      domainCheckoutType === "connectToWallet" &&
      account.isConnected
    ) {
      setDomainCheckoutType("buy");
    } else if (
      domainCheckoutType === "buy" &&
      ["idle", "error"].includes(register.state.value)
    ) {
      setDomainCheckoutType("transactionSubmitted");
      register.writeContract({
        abi: CONTROLLER_ABI,
        address: CONTROLLER_ADDRESS,
        functionName: "register",
        value: (price!.eth * 11n) / 10n,
        args: [
          account.address!,
          [normalize(domainName), registry.data!.name],
          domainAsPrimaryName,
          "0x0000000000000000000000000000000000000000",
          registry.data?.hasExpiringNames ? 1 : 0,
        ],
      });
    }
  }, [domainCheckoutType, register.state.value]);

  return (
    <LayoutDefault>
      <div className="flex flex-col justify-center items-center lg:items-start gap-lg lg:flex-row lg:gap-3.5xl mt-7 md:mt-14">
        <div className="w-full lg:max-w-[692px] grid grid-cols-1 gap-2xl">
          <div>
            <p className="text-base font-medium text-textBrandAquamarine mb-xs">
              Now Registering
            </p>
            <h1 className="text-6.5xl font-semibold text-textInverse mb-sm">
              {domainFullName}
            </h1>
            <div className="flex items-center gap-xxs">
              <img
                src={
                  true // TODO: fix me
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
                {/* <GroupSocialLinks
                  customLinkClassName="button-md py-0 px-1 flex items-center justify-center"
                  iconSize={16}
                /> */}
              </div>
              <div className="grid grid-cols-1 gap-md">
                <div>
                  <div className="my-6 flex justify-center">
                    <img
                      src={collectionData?.logoSrc}
                      width={72}
                      height={72}
                      alt=""
                    />
                  </div>
                  <p className="text-2xl font-semibold my-1 text-center">
                    {collectionData?.name}
                  </p>
                </div>
                <p className="text-base text-textSecondary text-center">
                  {collectionData?.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md bg-surfaceSecondary rounded-2xl p-md mt-xs">
                  <div className="flex flex-col items-start justify-center gap-sm">
                    <p className="text-sm text-textSecondary font-medium">
                      Registered Domains
                    </p>
                    <p className="text-2xl text-textInverse font-medium">
                      {registry.data?.totalSupply}
                    </p>
                    {/* <div className="flex gap-xxs items-center">
                      <IconChevronUp />
                      <span className="text-xs text-textSecondary font-medium">
                        <span className="text-[#19BB46]">2.45% </span>Past Week
                      </span>
                    </div> */}
                  </div>
                  <div className="flex flex-col items-start justify-center gap-sm">
                    <p className="text-sm text-textSecondary font-medium">
                      Unique Owners
                    </p>
                    <p className="text-2xl text-textInverse font-medium">
                      {registry.data?.uniqueOwners}
                    </p>
                    {/* <div className="flex gap-xxs items-center">
                      <IconChevronUp />
                      <span className="text-xs text-textSecondary font-medium">
                        <span className="text-[#19BB46]">1.08% </span>Past Week
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[383px]">
          {registry.data && domainCheckoutType === "overview" && (
            <DomainCheckoutOverview
              available={true}
              name={domainName || ""}
              primaryName={domainAsPrimaryName}
              onPrimaryNameChange={setDomainAsPrimaryName}
              onNext={handleNextStep}
              registry={registry.data}
            />
          )}
          {registry.data && domainCheckoutType === "connectToWallet" && (
            <DomainCheckoutConnectToWallet
              name={domainName || ""}
              registry={registry.data}
              primaryName={domainAsPrimaryName}
              onPrimaryNameChange={setDomainAsPrimaryName}
              onNext={handleNextStep}
            />
          )}
          {registry.data && domainCheckoutType === "buy" && (
            <DomainCheckoutBuy
              name={domainName || ""}
              registry={registry.data}
              primaryName={domainAsPrimaryName}
              onPrimaryNameChange={setDomainAsPrimaryName}
              onNext={handleNextStep}
            />
          )}
          {registry.data && domainCheckoutType === "transactionSubmitted" && (
            <DomainCheckoutTransactionSubmitted
              name={domainName || ""}
              registry={registry.data}
              txHash={
                "hash" in register.state ? register.state.hash : undefined
              }
            />
          )}
          {domainCheckoutType === "transactionComplete" && (
            <DomainCheckoutTransactionComplete
              name={domainName || ""}
              registry={registry.data!}
            />
          )}
        </div>
      </div>
    </LayoutDefault>
  );
}

export default DomainOverviewPage;
