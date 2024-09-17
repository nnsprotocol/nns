import { Hash } from "viem";
import { Domain } from "../../../services/graph";
import { covertDateToHumanReadable } from "../../../utils/date";
import IconArrowRight from "../../icons/IconArrowRight";
import { useAccount } from "wagmi";
import { getDomainImageURL } from "../../../utils/metadata";

type Props = {
  txHash?: Hash;
  domain: Domain;
  priceUSD: string;
  priceETH: string;
  years: number;
};

const DomainRenewSubmitted: React.FC<Props> = (props) => {
  const { chain } = useAccount();
  return (
    <div className="sm:min-w-[440px]">
      <div className="grid grid-cols-1 gap-xl">
        <div className="flex gap-xxs justify-center items-center">
          <div className="relative h-[74px] w-[74px] flex items-center justify-center">
            <img
              src="/brand/coin-hand-dark.svg"
              width={64}
              height={64}
              alt="Coin hand"
              className="rounded-full relative z-0 flex"
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
        <div>
          <p className="text-sm text-textInverse font-medium text-center mb-xs">
            Transaction submitted
          </p>
          {props.txHash && chain?.blockExplorers?.default && (
            <a
              href={chain.blockExplorers.default.url + "/tx/" + props.txHash}
              target="_blank"
              rel="noopener noreferrer"
              className="link-default text-textBrandLavender stroke-textBrandLavender text-xs justify-center"
            >
              <span>View Etherscan</span>
              <IconArrowRight size={12} />
            </a>
          )}
        </div>
        <div className="pt-md border-t border-borderPrimary">
          <div className="flex items-start gap-md">
            <img
              src={getDomainImageURL(props.domain)}
              width={116}
              height={116}
              className="rounded-lg border border-borderPrimary"
              alt=""
            />
            <div className="grid grid-cols-1 gap-xs">
              <span className="text-textInverse text-2xl font-medium mb-md">
                {props.domain.name}
              </span>
              <p className="text-textSecondary text-xs font-medium">
                New Expiration Date
              </p>
              <p className="text-textInverse text-[18px] font-medium">
                {calculateNewExpirationDate(props.domain, props.years)}
              </p>
              <p className="text-xs text-textSecondary font-medium">
                Prev. {covertDateToHumanReadable(props.domain.expiry || "0")}
              </p>
            </div>
            <div className="ms-auto self-end">
              <div className="grid grid-cols-1 gap-xs">
                <p className="text-xs text-textSecondary font-medium">Paying</p>
                <p className="text-textBrandLavender text-[18px] font-medium">
                  {props.priceUSD}
                </p>
                <p className="text-xs text-textSecondary font-medium">
                  {props.priceETH}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateNewExpirationDate(domain: Domain, years: number): string {
  if (!domain.expiry) {
    return "";
  }
  const expiry = new Date(parseInt(domain.expiry) * 1000);
  const newExpiry = new Date(
    expiry.getTime() + years * 365 * 24 * 60 * 60 * 1000
  );
  return covertDateToHumanReadable(newExpiry.toISOString());
}

export default DomainRenewSubmitted;
