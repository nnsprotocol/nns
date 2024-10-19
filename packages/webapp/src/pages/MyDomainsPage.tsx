import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import REWARDER_ABI from "../abi/IRewarder";
import IconArrowRight from "../components/icons/IconArrowRight";
import IconCopy from "../components/icons/IconCopy";
import LayoutDefault from "../components/layouts/LayoutDefault";
import DomainCollectionsCards from "../components/my-domains/DomainCollectionsCards";
import Tooltip from "../components/ui/Tooltip";
import { useAvatar } from "../services/ens";
import { useRegistries } from "../services/graph";
import { useResolvedName } from "../services/resolver";
import { REWARDER_ADDRESS, useRewardBalance } from "../services/rewarder";
import { useWriteContractWaitingForTx } from "../services/shared";
import { formatAddress, formatNOGS } from "../utils/formatter";
import { generateReferralLink, useCanRefer } from "../utils/Referral";
import toast from "react-hot-toast";

function MyDomainsPage() {
  const account = useAccount();
  const registries = useRegistries();
  const [resolverCld, setResolverCld] = useState<bigint | null>(null);
  const resolvedName = useResolvedName({
    account: account.address,
    cldId: resolverCld || undefined,
  });
  const avatarURL = useAvatar(account);
  const navigate = useNavigate();
  const canRefer = useCanRefer(account);
  const rewardBalance = useRewardBalance(account);
  const claimReward = useWriteContractWaitingForTx();
  const handleOnClaim = useCallback(() => {
    if (!account.address || claimReward.isLoading) {
      return;
    }

    claimReward.writeContract({
      abi: REWARDER_ABI,
      address: REWARDER_ADDRESS!,
      functionName: "withdraw",
      args: [account.address, [], []],
    });
  }, []);

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
              src={avatarURL.data || "/icons/profile.svg"}
              width={128}
              height={128}
              alt=""
              className="rounded-full"
            />
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
                  <Tooltip text="With NNS you can have a default name displayed everywhere or you can choose a different name for every community you’re a part of." />
                </span>
              </div>
            </div>
            <div className="border border-borderPrimary rounded-3xl py-md sm:px-md bg-surfacePrimary grid grid-cols-1 gap-md min-w-[332px]">
              <div>
                <div>
                  <div className="flex items-center justify-between mb-xs w-full text-sm font-medium">
                    <span className="text-textSecondary">Referral Rewards</span>
                    <span className="total-rewards-text-gradient">
                      {typeof rewardBalance.data !== "undefined"
                        ? formatNOGS(rewardBalance.data)
                        : "..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-xs mt-xs w-full text-sm font-medium">
                    <a
                      href="#"
                      className="link-default text-textSecondary hover:text-textInverse text-xs"
                    >
                      <span>Learn More</span>
                      <IconArrowRight size={12} />
                    </a>
                    <div
                      className="flex items-center justify-end gap-xxs text-xs text-textSecondary hover:text-textInverse font-medium cursor-pointer group"
                      onClick={() => {
                        if (account.address && canRefer) {
                          navigator.clipboard.writeText(
                            generateReferralLink(account.address)
                          );
                          toast("Link copied");
                        }
                      }}
                    >
                      {!canRefer && (
                        <Tooltip text="You need a .⌐◨-◨ name to start collecting money through Referrals. Get it now!" />
                      )}
                      {canRefer && (
                        <>
                          <IconCopy className="fill-textSecondary group-hover:fill-textInverse" />
                          <span>Share Referral</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1">
                {canRefer ? (
                  <button
                    type="button"
                    className="button-md button-secondary justify-center"
                    onClick={handleOnClaim}
                    disabled={Boolean(
                      !rewardBalance.data ||
                        rewardBalance.data === 0n ||
                        claimReward.isLoading
                    )}
                  >
                    Claim All
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-md button-secondary justify-center"
                    onClick={() => {
                      navigate("/collections/nns");
                    }}
                  >
                    Get a .⌐◨-◨
                  </button>
                )}
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
