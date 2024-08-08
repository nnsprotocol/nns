import { DomainItem } from "../../../types/domains";
import { covertDateToHumanReadable } from "../../../utils/date";
import IconArrowRight from "../../icons/IconArrowRight";

const DomainRenewCompleted: React.FC<{
  submittedDomainItem: DomainItem;
  handleCloseButtonClick: () => void;
}> = ({ submittedDomainItem, handleCloseButtonClick }) => {
  return (
    <div className="sm:min-w-[440px]">
      <div className="grid grid-cols-1 gap-xl">
        <div className="flex gap-xxs justify-center items-center">
          <img
            src="/brand/check-gradient-dark.svg"
            width={64}
            height={64}
            alt="Check"
            className="rounded-full"
          />
        </div>
        <div>
          <p className="text-sm text-textInverse font-medium text-center mb-xs">
            Transaction completed
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="link-default text-textBrandLavender stroke-textBrandLavender text-xs justify-center"
          >
            <span>View Etherscan</span>
            <IconArrowRight size={12} />
          </a>
        </div>
        <div className="pt-md border-t border-borderPrimary">
          <div className="flex items-start gap-md">
            <img
              src={submittedDomainItem.imgSrc}
              width={116}
              height={116}
              className="rounded-lg border border-borderPrimary"
              alt=""
            />
            <div className="grid grid-cols-1 gap-xs">
              <span className="text-textInverse text-2xl font-medium mb-md">
                {submittedDomainItem.name}
              </span>
              <p className="text-textSecondary text-xs font-medium">
                New Expiration Date
              </p>
              <p className="text-textInverse text-[18px] font-medium">
                10 Jun, 2026
              </p>
              <p className="text-xs text-textSecondary font-medium">
                Prev. {covertDateToHumanReadable(submittedDomainItem.expires)}
              </p>
            </div>
            <div className="self-end sm:ps-lg">
              <div className="grid grid-cols-1 gap-xs">
                <p className="text-xs text-textSecondary font-medium">Paying</p>
                <p className="text-textBrandLavender text-[18px] font-medium">
                  $100.12
                </p>
                <p className="text-xs text-textSecondary font-medium">
                  {submittedDomainItem.price} ETH
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1">
          <button
            type="button"
            className="button-md button-secondary justify-center"
            onClick={handleCloseButtonClick}
          >
            Back to My Domains
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainRenewCompleted;
