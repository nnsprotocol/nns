import { Link } from "react-router-dom";
import { Registry } from "../../services/graph";
import DomainCheckoutContainer from "./DomainCheckoutContainer";

type Props = {
  name: string;
  registry: Registry;
};

const DomainCheckoutTransactionComplete: React.FC<Props> = (props) => {
  return (
    <DomainCheckoutContainer>
      <div>
        <div className="px-md pb-md border-b border-borderLight grid grid-cols-1 gap-lg">
          <div className="flex gap-xxs justify-center items-center">
            <img
              src="/brand/check-gradient.svg"
              width={64}
              height={64}
              alt="Check"
              className="rounded-full"
            />
          </div>
          <p className="text-sm text-textSecondary font-medium text-center">
            Transaction complete
          </p>
        </div>
        <div className="py-xl">
          <p className="text-sm text-textSecondary font-medium text-center mb-md">
            You own
          </p>
          <div className="flex flex-col items-center gap-md">
            <div>
              <img
                src="/temp/domain-card.png"
                width={100}
                height={100}
                alt=""
                className="rounded-2xl object-contain bg-surfaceSecondary/10"
              />
            </div>
            <div className="flex flex-col text-center">
              <p className="text-2xl text-textPrimary mb-xs font-medium">
                {`${props.name}.${props.registry.name}`}
              </p>
              <p className="text-sm font-medium text-textSecondary">NNS Name</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-xs pt-md border-t border-borderLight px-md">
          <Link
            to="/account"
            className="button-brand-lavender button-lg rounded-xl justify-center"
          >
            See your Names
          </Link>
          <Link
            to="/"
            className="button-light button-lg rounded-xl justify-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </DomainCheckoutContainer>
  );
};

export default DomainCheckoutTransactionComplete;
