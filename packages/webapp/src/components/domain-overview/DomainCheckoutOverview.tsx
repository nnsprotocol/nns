import { useDomainPrice } from "../../services/controller";
import { Registry } from "../../services/graph";
import { formatETH, formatUSD } from "../../utils/formatter";
import IconArrowRight from "../icons/IconArrowRight";
import ToggleDefault from "../ui/inputs/ToggleDefault";
import Tooltip from "../ui/Tooltip";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

type Props = {
  name: string;
  registry: Registry;
  available: boolean;
  primaryName: boolean;
  onPrimaryNameChange: (value: boolean) => void;
  onNext: () => void;
};

const DomainCheckoutOverview: React.FC<Props> = (props) => {
  const price = useDomainPrice({
    cldId: props.registry.id,
    name: props.name,
  });

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
              {`${props.name}.${props.registry.name}`}
            </p>
            <p className="text-sm font-normal text-textSecondary mb-xs">
              NNS Domain
            </p>
            <p className="text-2xl text-textBrandLavender mt-auto font-medium">
              {price?.usd ? formatUSD(price?.usd) : "Loading..."}
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
            <p className="font-medium">Yours for</p>
            <div>
              <p className="font-medium text-textPrimary text-end mb-xs">
                {price?.usd ? formatUSD(price?.usd) : "Loading..."}
              </p>
              <p className="font-normal text-end">
                {price?.eth ? formatETH(price?.eth) : "Loading..."}
              </p>
            </div>
          </div>
          {props.registry.hasExpiringNames ? (
            <div className="flex gap-xs justify-between text-sm">
              <p className="font-medium">Expiration Date</p>
              <div>
                <p className="font-medium text-textPrimary text-end mb-xs">
                  {new Date(
                    Date.now() + 365 * 3600 * 24 * 1000
                  ).toLocaleDateString()}
                </p>
                <p className="font-normal text-end">1 Year</p>
              </div>
            </div>
          ) : null}

          {/* <div className="flex gap-xs justify-between text-sm">
            <p className="font-medium">Est. Gas Fees</p>
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
        <div className="grid grid-cols-1 gap-xs">
          <button
            type="button"
            className="button-brand-lavender button-lg justify-center rounded-2xl"
            disabled={!props.available}
            onClick={props.onNext}
          >
            <span>Get your Name</span>
            <IconArrowRight />
          </button>
          {props.registry.hasExpiringNames ? null : (
            <p className="text-textSecondary text-sm text-center">
              This name is yours forever. No renewal fees!
            </p>
          )}
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutOverview;
