import { Hash } from "viem";
import { useAccount } from "wagmi";
import { Registry } from "../../services/graph";
import IconArrowRight from "../icons/IconArrowRight";
import DomainCheckoutContainer from "./DomainCheckoutContainer";
import { getTemplateNFTImageURL } from "../../services/images";

type Props = {
  name: string;
  registry: Registry;
  txHash?: Hash;
};

const DomainCheckoutTransactionSubmitted: React.FC<Props> = (props) => {
  const { chain } = useAccount();
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
                src={getTemplateNFTImageURL(props.name, props.registry)}
                width={100}
                height={100}
                alt=""
                className="object-contain"
              />
            </div>
            <div className="flex flex-col text-center">
              <p className="text-2xl text-textPrimary mb-xs font-medium">
                {`${props.name}.${props.registry.name}`}
              </p>
              <p className="text-sm font-medium text-textSecondary">
                NNS Domain
              </p>
            </div>
          </div>
        </div>
        {chain?.blockExplorers?.default && props.txHash ? (
          <div className="flex justify-center pt-md border-t border-borderLight">
            <a
              href={`${chain.blockExplorers.default.url}/tx/${props.txHash}`}
              target="_blank"
              className="link-brand-lavender"
            >
              <span>View Etherscan</span>
              <IconArrowRight />
            </a>
          </div>
        ) : null}
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutTransactionSubmitted;
