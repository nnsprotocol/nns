import { useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { useDomainPrice } from "../../services/controller";
import { NOGGLES_CLD_ID, Registry } from "../../services/graph";
import { formatETH, formatPrice, formatUSD } from "../../utils/formatter";
import IconArrowRight from "../icons/IconArrowRight";
import ToggleDefault from "../ui/inputs/ToggleDefault";
import Tooltip from "../ui/Tooltip";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

type Props = {
  name: string;
  registry: Registry;
  isFree: boolean;
  primaryName: boolean;
  error?: string;
  onPrimaryNameChange: (value: boolean) => void;
  onNext: () => void;
};

const DomainCheckoutBuy: React.FC<Props> = (props) => {
  const price = useDomainPrice({
    cldId: props.registry.id,
    name: props.name,
  });
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
  });

  const hasEnoughBalance = useMemo(() => {
    if (!balance.data || !price?.eth) {
      return true;
    }
    return balance.data.value >= (price.eth * 11n) / 10n; // 10% extra
  }, [balance.data, price]);

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
            Buy name
          </p>
        </div>
        <div className="text-textSecondary grid grid-cols-1 px-md">
          <div className="py-md">
            <p className="text-sm font-medium mb-sm">You Pay</p>
            <div className="flex gap-md justify-between items-center mb-sm">
              <span className="text-2xl text-textPrimary font-medium">
                {formatPrice({
                  price: price?.usd,
                  isFree: props.isFree,
                  unit: "usd",
                })}
              </span>
              <img src="/temp/ether-coin.svg" width={25} height={25} />
            </div>
            <div className="flex gap-md justify-between items-center">
              <span className="text-sm text-textSecondary font-medium">
                {formatPrice({
                  price: price?.eth,
                  isFree: props.isFree,
                  unit: "eth",
                })}
              </span>
              <span className="text-sm text-textSecondary font-medium">
                Balance:{" "}
                {balance.data ? formatETH(balance.data?.value) : "Loading..."}
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
                  {[props.name, props.registry.name].join(".")}
                </p>
                <p className="text-sm font-normal text-textSecondary">
                  NNS Name
                </p>
              </div>
            </div>
            {props.registry.id.toLowerCase() ===
            NOGGLES_CLD_ID.toLowerCase() ? (
              <div className="bg-surfacePinkGradient py-xs px-sm rounded-2xl relative">
                <div className="absolute left-0 top-0 bottom-[8px] right-[10px] rounded-2xl z-0 bg-[url('/brand/coins.svg')] bg-no-repeat bg-right"></div>
                <div className="grid grid-cols-1 max-w-[75%] gap-xs relative z-10">
                  <p className="text-base text-textInverse font-medium">
                    Did you know?
                  </p>
                  <p className="text-base text-[#FC76C3] font-medium">
                    This name will allow you to earn up to 35% in referral
                    rewards
                  </p>
                  <a href="#" className="link-default">
                    <IconArrowRight />
                    <span>Discover More</span>
                    <IconArrowRight />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-textSecondary grid grid-cols-1 gap-md p-md border-t border-borderLight">
          {/* <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Gas Fees</p>
            <div>
              <p className="font-medium text-textPrimary text-end mb-xs">
                $13.28
              </p>
              <p className="font-normal text-end">0.004 ETH</p>
            </div>
          </div> */}
          <div className="flex gap-xs justify-between">
            <p className="flex gap-xxs items-center text-sm font-medium">
              <span>Set as primary name</span> <Tooltip text="lorem ipsum" />
            </p>
            <ToggleDefault
              isOn={props.primaryName}
              setIsOn={props.onPrimaryNameChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-xs px-md">
          <button
            type="button"
            className="button-brand-lavender button-lg justify-center rounded-2xl"
            disabled={!hasEnoughBalance || !price?.eth === undefined}
            onClick={props.onNext}
          >
            {hasEnoughBalance ? "Buy Name" : "Insufficient Balance"}
          </button>
          {props.error && (
            <p className="text-red-500 text-sm text-center">{props.error}</p>
          )}
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutBuy;
