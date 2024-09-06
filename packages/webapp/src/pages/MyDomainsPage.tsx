import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import IconArrowRight from "../components/icons/IconArrowRight";
import IconCopy from "../components/icons/IconCopy";
import IconInfo from "../components/icons/IconInfo";
import IconPlus from "../components/icons/IconPlus";
import LayoutDefault from "../components/layouts/LayoutDefault";
import DomainCollectionsCards from "../components/my-domains/DomainCollectionsCards";
import { useRegistries } from "../services/graph";
import { useResolvedName } from "../services/resolver";
import { formatAddress } from "../utils/formatter";

function MyDomainsPage() {
  const account = useAccount();
  const registries = useRegistries();
  const [resolverCld, setResolverCld] = useState<bigint | null>(null);
  const resolvedName = useResolvedName({
    account: account.address,
    cldId: resolverCld || undefined,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!account.isConnected) {
      navigate("/");
    }
  }, [account.isConnected]);

  const onSelectChange = useCallback(
    (value: string) => {
      if (value === "default") {
        setResolverCld(null);
      } else {
        const reg = registries.data?.find((r) => r.id === value)!;
        setResolverCld(BigInt(reg.id));
      }
    },
    [registries.data]
  );

  return (
    <LayoutDefault>
      <div className="mt-8 flex w-full">
        <div className="mx-auto grid grid-cols-1 gap-xl  w-full max-w-[1200px]">
          <div className="relative max-w-32">
            <img
              src="/temp/profile-lg.png"
              width={128}
              height={128}
              alt=""
              className="rounded-full"
            />
            <button
              type="button"
              className="flex items-center justify-center rounded-full button-brand-lavender h-7 w-7 absolute right-0 bottom-0"
            >
              <IconPlus />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-lg">
            <div>
              <p className="text-base font-medium mb-xs flex gap-xxs items-center">
                <span className="text-textBrandAquamarine">
                  {formatAddress(account.address)}
                </span>
                <span className="text-textSecondary">known as</span>
              </p>
              <p className="text-textInverse text-3xl font-semibold my-xs">
                {resolvedName.isLoading ? "" : resolvedName.data}
              </p>
              <div className="flex gap-xxs items-center text-textSecondary text-base font-medium">
                {resolverCld ? "in" : ""}
                <select
                  id="countries"
                  className="text-textInverse stroke-textInverse bg-black rounded-lg block"
                  onChange={(e) => onSelectChange(e.currentTarget.value)}
                  defaultValue="default"
                >
                  <option value="default">Everywhere</option>
                  {registries.data?.map((registry) => (
                    <option key={registry.id} value={registry.id}>
                      {registry.name}
                    </option>
                  ))}
                </select>
                {resolverCld ? "community" : null}
                <span className="flex">
                  <IconInfo size={16} />
                </span>
              </div>
            </div>
            <div className="border border-borderPrimary rounded-3xl py-md sm:px-md bg-surfacePrimary grid grid-cols-1 gap-md min-w-[332px]">
              <div>
                <div className="border-b border-borderPrimary mb-xs pb-xs">
                  <div className="flex items-center justify-between mb-xs w-full text-sm font-medium">
                    <span className="text-textSecondary">Referral Rewards</span>
                    <span className="text-textInverse">105.23 NOGS</span>
                  </div>
                  <div className="flex items-center justify-end gap-xxs text-xs text-textSecondary font-medium">
                    <IconCopy />
                    <span>Share Referral</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-xs w-full text-sm font-medium">
                    <span className="text-textSecondary">Total Rewards</span>
                    <span className="total-rewards-text-gradient">
                      535.43 NOGS
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-xxs">
                    <a href="#" className="link-default text-xs">
                      <span>Learn More</span>
                      <IconArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1">
                <button
                  type="button"
                  className="button-md button-secondary justify-center"
                >
                  Claim All
                </button>
              </div>
            </div>
          </div>
          <DomainCollectionsCards />
        </div>
      </div>
    </LayoutDefault>
  );
}

export default MyDomainsPage;
