import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Address, namehash } from "viem";
import { normalize } from "viem/ens";
import { useAccount } from "wagmi";
import CONTROLLER_ABI from "../abi/IController";
import DomainCheckoutBuy from "../components/domain-overview/DomainCheckoutBuy";
import DomainCheckoutOverview from "../components/domain-overview/DomainCheckoutOverview";
import DomainCheckoutTransactionComplete from "../components/domain-overview/DomainCheckoutTransactionComplete";
import DomainCheckoutTransactionSubmitted from "../components/domain-overview/DomainCheckoutTransactionSubmitted";
import DomainCheckoutConnectToWallet from "../components/domain-overview/DomainCheckoutСonnectToWallet";
import LayoutDefault from "../components/layouts/LayoutDefault";
import {
  fetchRegisterSignature,
  useRegistrationAvailability,
} from "../services/api";
import { useCollectionData } from "../services/collections";
import { CONTROLLER_ADDRESS, useDomainPrice } from "../services/controller";
import { Registry, useDomain, useRegistry } from "../services/graph";
import {
  useWriteContractWaitingForTx,
  useWriteContractWithServerRequest,
} from "../services/shared";
import { DomainCheckoutType } from "../types/domains";

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

function useRegistrationStatus(d: {
  registry?: Registry;
  name?: string;
  to?: Address;
}) {
  const av = useRegistrationAvailability({
    cld: d.registry?.name,
    name: d.name,
    to: d.to,
    enabled: Boolean(d.registry?.registrationWithSignature),
  });
  const domain = useDomain({
    cld: d.registry?.name,
    name: d.name,
  });

  const status = useMemo(() => {
    if (typeof domain.data === "undefined" || !d.registry) {
      return undefined;
    }

    if (domain.data !== null) {
      return "owned";
    }
    if (!d.registry.registrationWithSignature) {
      return "available";
    }

    if (!av.data) {
      return undefined;
    }

    if (av.data.canRegister) {
      return "available";
    }

    return "reserved";
  }, [av, domain, d.registry]);

  return {
    status,
    isLoading: av.isLoading || domain.isLoading,
    error: av.error || domain.error,
  };
}

import * as Sentry from "@sentry/react";
import { useReferral } from "../utils/Referral";

function DomainOverviewPage() {
  const [domainCheckoutType, setDomainCheckoutType] =
    useState<DomainCheckoutType>("overview");
  const [domainAsPrimaryName, setDomainAsPrimaryName] = useState(true);

  const account = useAccount();
  const referrer = useReferral();

  useEffect(() => {
    Sentry.setUser(
      account.address ? { id: account.address.toLowerCase() } : null
    );
  }, [account.address]);

  const navigate = useNavigate();
  const { domainName: domainFullName } = useParams<{ domainName: string }>();
  const [domainName, cldName] = useMemo(
    () => domainFullName?.toLowerCase()?.split(".") || [],
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

  const regStatus = useRegistrationStatus({
    registry: registry.data || undefined,
    name: domainName,
    to: account.address,
  });
  const availabilityImgSrc = useMemo(() => {
    switch (regStatus?.status) {
      case "owned":
        return "/badges/unavailable-md.svg";
      case "reserved":
        return "/badges/reserved-md.svg";
      case "available":
        return "/badges/available-md.svg";
      default:
        return null;
    }
  }, [regStatus]);

  const register = useWriteContractWaitingForTx();
  const registerWithSignature = useWriteContractWithServerRequest({
    fetchServerData: () =>
      fetchRegisterSignature({
        to: account.address!,
        labels: [domainName, cldName],
        periods: registry.data?.hasExpiringNames ? 1 : 0,
        referer: referrer,
        withReverse: domainAsPrimaryName,
      }),
    startTransaction(serverData, writeContract) {
      writeContract({
        abi: CONTROLLER_ABI,
        address: CONTROLLER_ADDRESS,
        functionName: "registerWithSignature",
        value: (price!.eth * 11n) / 10n,
        args: [
          serverData.to,
          [normalize(domainName), registry.data!.name],
          domainAsPrimaryName,
          referrer,
          registry.data?.hasExpiringNames ? 1 : 0,
          BigInt(serverData.nonce),
          BigInt(serverData.expiry),
          serverData.signature,
        ],
      });
    },
    enabled: Boolean(registry.data) && Boolean(account.address),
  });

  const txStatus = useMemo(() => {
    if (registry.data?.registrationWithSignature) {
      return registerWithSignature.state;
    } else {
      return register.state;
    }
  }, [
    register.state,
    registerWithSignature.state,
    registry.data?.registrationWithSignature,
  ]);

  useEffect(() => {
    if (
      txStatus.value === "idle" &&
      domainCheckoutType === "transactionSubmitted"
    ) {
      setDomainCheckoutType("buy");
    } else if (txStatus.value === "success") {
      setDomainCheckoutType("transactionComplete");
    } else if (
      txStatus.value === "error" &&
      domainCheckoutType === "transactionSubmitted"
    ) {
      setDomainCheckoutType("buy");
    }
  }, [txStatus.value]);

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
      ["idle", "error"].includes(txStatus.value)
    ) {
      setDomainCheckoutType("transactionSubmitted");
      if (registry.data?.registrationWithSignature) {
        registerWithSignature.write();
      } else {
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
    }
  }, [domainCheckoutType, txStatus.value]);

  return (
    <LayoutDefault defaultRegistry={registry.data || undefined}>
      <div className="flex flex-col justify-center items-center lg:items-start gap-lg lg:flex-row lg:gap-3.5xl mt-7 md:mt-14">
        <div className="w-full lg:max-w-[692px] grid grid-cols-1 gap-2xl">
          <div>
            <p className="text-base font-medium text-textBrandAquamarine mb-xs">
              Claiming
            </p>
            <h1 className="text-6.5xl font-semibold text-textInverse mb-sm text-nowrap">
              {normalize(domainFullName || "")}
            </h1>
            {availabilityImgSrc && (
              <div className="flex items-center gap-xxs">
                <img
                  src={availabilityImgSrc}
                  className="h-[30px] w-auto"
                  alt=""
                />
                <p className="text-base text-textSecondary font-medium">
                  • {collectionData?.nameDescription(domainName) || ""}
                </p>
              </div>
            )}
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
                      Registered Names
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
          {registry.data &&
            price &&
            regStatus.status &&
            domainCheckoutType === "overview" && (
              <DomainCheckoutOverview
                available={regStatus.status === "available"}
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
              error={
                txStatus.value === "error" ? txStatus.formattedError : undefined
              }
            />
          )}
          {registry.data && domainCheckoutType === "transactionSubmitted" && (
            <DomainCheckoutTransactionSubmitted
              name={domainName || ""}
              registry={registry.data}
              txHash={"hash" in txStatus ? txStatus.hash : undefined}
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
