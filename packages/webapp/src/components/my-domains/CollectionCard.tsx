import IconStar from "../icons/IconStar";
import { DomainCollection } from "../../types/domains";
import { useMemo } from "react";

const CollectionCard: React.FC<{
  collectionItem: DomainCollection;
  handleManageClick: (collectionItem: DomainCollection) => void;
}> = ({ collectionItem, handleManageClick }) => {
  const domainsQuantity = useMemo(
    () => collectionItem.domains.length,
    [collectionItem.domains]
  );

  const slicedDomains = useMemo(
    () => collectionItem.domains.slice(0, 3),
    [collectionItem.domains]
  );

  return (
    <div className="collection-card group border border-borderPrimary rounded-32 bg-surfacePrimary p-lg grid grid-cols-1 gap-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-xxs p-xxs pr-xs rounded-128 bg-surfaceSecondary">
          <div
            className="h-[22px] w-[22px] rounded-full bg-cover bg-no-repeat"
            style={{
              boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
              backgroundImage: `url('${collectionItem.imgSrc}')`,
            }}
          ></div>
          <span className="text-sm font-medium text-textInverse">
            {collectionItem.name}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          {domainsQuantity && (
            <span
              className={`${
                domainsQuantity > 1
                  ? "text-textSecondary group-hover:text-textInverse"
                  : "text-textBrandLavender"
              } text-sm font-medium`}
            >
              {domainsQuantity > 1
                ? `${domainsQuantity} Domains`
                : `${domainsQuantity} Domain`}
            </span>
          )}
          <span className="w-[30px] h-[30px] rounded-lg bg-surfaceSecondary flex items-center justify-center">
            <IconStar
              fill={collectionItem.isPreffered ? "#C496FF" : "#FFFFFF"}
            />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-32">
        <div className="domain-cards">
          {slicedDomains.map((item) => (
            <img
              key={`${collectionItem.id}-${item.id}-card`}
              src={item.imgSrc}
              width={100}
              height={100}
              alt=""
              className="border-2 border-borderPrimary rounded-2xl"
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
            {collectionItem.resolvingAs}
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => handleManageClick(collectionItem)}
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
