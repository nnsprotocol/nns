import { useState } from "react";
import { Hash } from "viem";
import { useAccount } from "wagmi";
import RESOLVER_ABI from "../../../abi/IResolver";
import { useRegistry } from "../../../services/graph";
import {
  RESOLVER_ADDRESS,
  useDefaultCld,
  useResolvedName,
} from "../../../services/resolver";
import { useWriteContractWaitingForTx } from "../../../services/shared";
import IconInfo from "../../icons/IconInfo";
import DomainMgmtSetPrimary from "./DomainMgmtSetPrimary";
import DomainMgmtRenew from "./DomainMgmtRenew";
import { getCollectionLogoURL } from "../../../services/collections";

type Tab = "domains" | "renew";

type Props = {
  cldId: Hash | bigint;
  onClose: () => void;
};

export default function DomainMgmtModalContent(props: Props) {
  const registry = useRegistry({
    id: props.cldId,
  });
  const account = useAccount();
  const resolvedName = useResolvedName({
    account: account.address,
    cldId: registry.data?.id,
  });
  const [activeTab, setActiveTab] = useState<Tab>("domains");
  const defaultCld = useDefaultCld({
    account: account.address,
  });

  const setDefaultCld = useWriteContractWaitingForTx();
  function handleSetDefaultCld() {
    if (setDefaultCld.isLoading || !account.address) {
      return;
    }

    setDefaultCld.writeContract({
      abi: RESOLVER_ABI,
      address: RESOLVER_ADDRESS,
      functionName: "setDefaultCld",
      args: [account.address, BigInt(props.cldId)],
    });
  }

  if (!registry.data) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="pb-2xl lg:pe-lg lg:pb-xs xl:min-w-64">
        <div className="mb-4">
          <div
            className="h-[50px] w-[50px] rounded-full bg-cover bg-no-repeat"
            style={{
              boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
              backgroundImage: `url('${getCollectionLogoURL(
                registry.data.id
              )}')`,
            }}
          ></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-lg pb-md border-b mb-md border-borderPrimary">
          <div>
            <p className="text-textSecondary text-sm font-medium mb-sm">
              Collection
            </p>
            <p className="text-textInverse text-[18px] font-semibold">
              {registry.data.name}
            </p>
          </div>
          <div>
            <p className="text-textSecondary text-sm font-medium mb-sm">
              Resolving as
            </p>
            <p className="text-textInverse text-[18px] font-semibold">
              {resolvedName.data}
            </p>
          </div>
        </div>
        <div>
          <div>
            <p className="text-textSecondary text-xs font-medium mb-md flex items-center gap-xxs">
              <span>What does it mean?</span>
              <span>
                <IconInfo />
              </span>
            </p>
            {defaultCld.data !== BigInt(props.cldId) ? (
              <button
                onClick={handleSetDefaultCld}
                type="button"
                className="button-md button-secondary"
                disabled={setDefaultCld.isLoading}
              >
                {setDefaultCld.isLoading
                  ? "Loading..."
                  : "Set as preferred collection"}
              </button>
            ) : (
              <button
                type="button"
                className="button-md button-secondary"
                disabled={true}
              >
                Preferred collection
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="ps-lg border-s border-borderPrimary">
        {registry.data.hasExpiringNames && (
          <div className="flex mb-8">
            <button
              type="button"
              className={`uppercase pb-md px-xl text-textInverse font-medium text-xs border-b border-transparent ${
                activeTab === "domains" && "!border-borderBrandLavender"
              }`}
              onClick={() => setActiveTab("domains")}
            >
              Domains
            </button>
            <button
              type="button"
              className={`uppercase pb-md px-xl text-textInverse font-medium text-xs border-b border-transparent  ${
                activeTab === "renew" && "!border-borderBrandLavender"
              }`}
              onClick={() => setActiveTab("renew")}
            >
              Renew
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <div className="min-w-[555px]">
            {activeTab === "domains" && (
              <DomainMgmtSetPrimary registry={registry.data} />
            )}
            {activeTab === "renew" && (
              <DomainMgmtRenew
                registry={registry.data}
                onClose={props.onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
