import { useMemo } from "react";
import { CollectionPreview } from "../../services/graph";
import { getDomainImageURL } from "../../utils/metadata";
import IconStar from "../icons/IconStar";

type Props = {
  collection: CollectionPreview;
  defaultCldId: bigint;
  onManageClick?: () => void;
};

const CollectionCard: React.FC<Props> = (props) => {
  const isDefaultCld = useMemo(() => {
    return props.defaultCldId === BigInt(props.collection.registry.id);
  }, [props.defaultCldId, props.collection.registry]);

  return (
    <div className="collection-card group border border-borderPrimary rounded-32 bg-surfacePrimary p-lg grid grid-cols-1 gap-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-xxs p-xxs pr-xs rounded-128 bg-surfaceSecondary">
          <div
            className="h-[22px] w-[22px] rounded-full bg-cover bg-no-repeat"
            style={{
              boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
              backgroundImage: `url('https://picsum.photos/200?random=${props.collection.registry.id}')`,
            }}
          ></div>
          <span className="text-sm font-medium text-textInverse">
            {props.collection.registry.name}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <span
            className={`${
              isDefaultCld
                ? "text-textBrandLavender"
                : "text-textSecondary group-hover:text-textInverse"
            } text-sm font-medium`}
          >
            {parseInt(props.collection.numberOfDomains) > 1
              ? `${props.collection.numberOfDomains} Domains`
              : `${props.collection.numberOfDomains} Domain`}
          </span>
          <span className="w-[30px] h-[30px] rounded-lg bg-surfaceSecondary flex items-center justify-center">
            <IconStar fill={isDefaultCld ? "#C496FF" : "#FFFFFF"} />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-32">
        <div className="domain-cards">
          {props.collection.registry.previewDomains?.map((domain) => (
            <img
              key={domain.id}
              src={getDomainImageURL(domain)}
              width={100}
              height={100}
              alt=""
              className="border-2 border-borderPrimary"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-lg">
        <div className="grid grid-cols-1 gap-xs">
          <span className="text-sm text-textSecondary font-medium">
            Resolving as
          </span>
          <span className="text-[18px] text-textInverse font-semibold">
            {props.collection.registry.primaryDomain?.[0]?.name ||
              "No primary name"}
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => props.onManageClick?.()}
            className="button-secondary button-lg rounded-2xl"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
