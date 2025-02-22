import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useDomainPrice } from "../../services/controller";
import { Registry } from "../../services/graph";
import { formatPrice } from "../../utils/formatter";
import IconElectricalPlug from "../icons/IconElectricalPlug";
import ToggleDefault from "../ui/inputs/ToggleDefault";
import Tooltip from "../ui/Tooltip";
import DomainCheckoutContainer from "./DomainCheckoutContainer";
import { getTemplateNFTImageURL } from "../../services/images";

type Props = {
  name: string;
  registry: Registry;
  isFree: boolean;
  primaryName: boolean;
  onPrimaryNameChange: (value: boolean) => void;
  onNext: () => void;
};

const DomainCheckoutConnectToWallet: React.FC<Props> = (props) => {
  const account = useAccount();
  const price = useDomainPrice({
    cldId: props.registry.id,
    name: props.name,
  });
  const { openConnectModal } = useConnectModal();

  const onNext = props.onNext;
  useEffect(() => {
    if (account.isConnected) {
      onNext();
    }
  }, [onNext, account.isConnected]);

  return (
    <DomainCheckoutContainer>
      <div>
        <div className="px-md pb-md border-b border-borderLight grid grid-cols-1 gap-lg">
          <div className="flex gap-xxs justify-center items-center">
            <img
              src="/temp/user.png"
              width={64}
              height={64}
              alt="User"
              className="rounded-full"
            />
            <IconElectricalPlug />
            <img
              src="/temp/nns.svg"
              width={64}
              height={64}
              alt="User"
              className="rounded-full bg-surfacePrimary"
            />
          </div>
          <p className="text-sm text-textSecondary font-medium text-center">
            Connect wallet to purchase
          </p>
        </div>
        <div className="text-textSecondary grid grid-cols-1 px-md">
          <div className="py-md">
            <p className="text-sm font-medium mb-sm">You Pay</p>
            <div className="flex gap-md justify-between items-center mb-sm">
              <span className="text-2xl text-textPrimary font-medium">
                {formatPrice({
                  price: price?.eth,
                  isFree: props.isFree,
                  unit: "eth",
                })}
              </span>
              <img src="/temp/ether-coin.svg" width={25} height={25} />
            </div>
            <div className="flex gap-md justify-between items-center">
              <span className="text-sm text-textSecondary font-medium">
                {formatPrice({
                  price: price?.usd,
                  isFree: props.isFree,
                  unit: "usd",
                })}
              </span>
              {/* <span className="text-sm text-textSecondary font-medium">
                Balance: --
              </span> */}
            </div>
          </div>
          <div className="border-t border-borderLight py-md">
            <p className="text-sm font-medium mb-sm">You Get</p>
            <div className="flex gap-md pb-md">
              <div>
                <img
                  src={getTemplateNFTImageURL(props.name, props.registry)}
                  width={52}
                  height={52}
                  alt=""
                  className="object-contain"
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
            {/* <div className="bg-surfacePinkGradient py-xs px-sm rounded-2xl relative">
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
            </div> */}
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
              <span>Set as primary name</span>{" "}
              <Tooltip text="This links your address to this name, allowing it to be displayed across the NNS ecosystem. You can have one primary address per collection." />
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
            className="button-secondary button-lg justify-center rounded-2xl"
            onClick={openConnectModal}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutConnectToWallet;
