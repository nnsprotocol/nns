import { useMemo, useState } from "react";
import { DomainCollection, DomainItem } from "../../../types/domains";
import IconInfo from "../../icons/IconInfo";
import ToggleDefault from "../../ui/inputs/ToggleDefault";
import { covertDateToHumanReadable } from "../../../utils/date";
import BadgePrimaryName from "../../ui/badges/BadgePrimaryName";
import IconPersonCard from "../../icons/IconPersonCard";
import IconChevronUp from "../../icons/IconChevronUp";
import IconPlus from "../../icons/IconPlus";
import IconMinus from "../../icons/IconMinus";
import IconArrowRight from "../../icons/IconArrowRight";

const DomainManage: React.FC<{
  selectedCollectionItem: DomainCollection;
  handleRenewSubmit: (item: DomainItem) => void;
  setSelectedCollectionItem: React.Dispatch<
    React.SetStateAction<DomainCollection | null>
  >;
}> = ({
  selectedCollectionItem,
  setSelectedCollectionItem,
  handleRenewSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<"domains" | "renew">("domains");

  const domainsQuantity = useMemo(
    () => selectedCollectionItem.domains.length,
    [selectedCollectionItem.domains]
  );

  const handleRenewDomainItemButtonClick = (item: DomainItem) => {
    handleRenewSubmit(item);
  };

  const domainsTabContent = (
    <div className="grid grid-cols-1 gap-xl w-full">
      <table>
        <thead>
          <tr>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-md text-start leading-4">
              Name
            </th>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-md flex gap-xxs items-center text-start leading-4">
              <span>Rewards</span>
              <IconInfo />
            </th>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-md text-end leading-4">
              Expires
            </th>
            <th className="p-0 leading-4"></th>
          </tr>
        </thead>
        <tbody>
          {selectedCollectionItem.domains.map((item) => (
            <tr key={item.id} className="border-b border-borderPrimary">
              <td className="py-md pe-md">
                <div className="flex items-center gap-xs">
                  <img
                    src={item.imgSrc}
                    width={72}
                    height={72}
                    className="rounded-lg border border-borderPrimary"
                    alt=""
                  />
                  <span className="text-textInverse text-sm font-medium">
                    {item.name}
                  </span>
                </div>
              </td>
              <td className="py-md pe-md">
                <span className="text-sm text-textSecondary font-medium">
                  {item.rewards}
                </span>
              </td>
              <td className="py-md pe-md">
                <span className="text-sm text-textInverse font-medium">
                  {covertDateToHumanReadable(item.expires)}
                </span>
              </td>
              <td className="py-md">
                {item.isPrimary && <BadgePrimaryName />}
                {!item.isPrimary && (
                  <button
                    type="button"
                    className="button-md button-secondary w-full justify-center"
                  >
                    Set as Primary
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-xs justify-between items center">
        <div className="flex items-center gap-xxs">
          <IconPersonCard />
          <span className="text-sm font-medium text-textSecondary">
            {domainsQuantity > 1
              ? `${domainsQuantity} Domains`
              : `${domainsQuantity} Domain`}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            className="button-secondary button-sm rounded-full"
            disabled
          >
            <span className="-rotate-90">
              <IconChevronUp size={12} />
            </span>
          </button>
          <button
            type="button"
            className="button-secondary button-sm rounded-full"
            disabled
          >
            <span className="rotate-90">
              <IconChevronUp size={12} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renewTabContent = (
    <div className="grid grid-cols-1 gap-xl w-full">
      <table>
        <thead>
          <tr>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-xs text-start leading-4">
              Name
            </th>
            <th className="text-textSecondary text-xs font-medium pb-sm px-xs text-center leading-4">
              RENEW FOR (Years)
            </th>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-xs text-center leading-4">
              Total
            </th>
            <th className="p-0 leading-4"></th>
          </tr>
        </thead>
        <tbody>
          {selectedCollectionItem.domains.map((item) => (
            <tr key={item.id} className="border-b border-borderPrimary group">
              <td className="py-md pe-xs">
                <div className="flex items-center gap-xs">
                  <img
                    src={item.imgSrc}
                    width={72}
                    height={72}
                    className="rounded-lg border border-borderPrimary"
                    alt=""
                  />
                  <div className="grid grid-cols-1 gap-xs">
                    <span className="text-textInverse text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="text-xs text-textSecondary font-medium">
                      {covertDateToHumanReadable(item.expires)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-md px-xs">
                <div className="flex justify-center">
                  <div className="flex items-center gap-xs p-xxs rounded-128 border border-borderPrimary">
                    <button
                      type="button"
                      className="button-secondary button-sm rounded-full"
                    >
                      <IconMinus />
                    </button>
                    <span className="px-xs min-w-3 text-center text-xs text-textSecondary font-medium group-hover:text-textInverse">
                      1
                    </span>
                    <button
                      type="button"
                      className="button-secondary button-sm rounded-full"
                    >
                      <IconPlus />
                    </button>
                  </div>
                </div>
              </td>
              <td className="py-md px-xs">
                <div className="text-end text-textSecondary font-medium">
                  <div className="mb-xs text-sm group-hover:text-textBrandLavender">
                    $100.12
                  </div>
                  <div className="text-xs group-hover:text-textInverse">
                    {item.price}ETH
                  </div>
                </div>
              </td>
              <td className="py-md">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="button-sm bg-surfaceSecondary stroke-surfacePrimary border border-surfaceSecondary group-hover:button-brand-lavender rounded-full"
                    onClick={() => handleRenewDomainItemButtonClick(item)}
                  >
                    <IconArrowRight />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-xs justify-between items center">
        <div className="flex items-center gap-xxs">
          <IconPersonCard />
          <span className="text-sm font-medium text-textSecondary">
            {domainsQuantity > 1
              ? `${domainsQuantity} Domains`
              : `${domainsQuantity} Domain`}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            className="button-secondary button-sm rounded-full"
            disabled
          >
            <span className="-rotate-90">
              <IconChevronUp size={12} />
            </span>
          </button>
          <button
            type="button"
            className="button-secondary button-sm rounded-full"
            disabled
          >
            <span className="rotate-90">
              <IconChevronUp size={12} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="pb-2xl lg:pe-lg lg:pb-xs xl:min-w-64">
        <div className="mb-4">
          <div
            className="h-[50px] w-[50px] rounded-full bg-cover bg-no-repeat"
            style={{
              boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
              backgroundImage: `url('${selectedCollectionItem.imgSrc}')`,
            }}
          ></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-lg pb-md border-b mb-md border-borderPrimary">
          <div>
            <p className="text-textSecondary text-sm font-medium mb-sm">
              Collection
            </p>
            <p className="text-textInverse text-[18px] font-semibold">
              {selectedCollectionItem.name}
            </p>
          </div>
          <div>
            <p className="text-textSecondary text-sm font-medium mb-sm">
              Resolving as
            </p>
            <p className="text-textInverse text-[18px] font-semibold">
              {selectedCollectionItem.resolvingAs}
            </p>
          </div>
        </div>
        <div>
          <div>
            <p className="text-textSecondary text-xs font-medium mb-md flex items-center gap-xxs">
              <span>Set as preffered collection</span>
              <span>
                <IconInfo />
              </span>
            </p>
            <ToggleDefault
              isOn={selectedCollectionItem.isPreffered}
              setIsOn={(value: boolean) => {
                setSelectedCollectionItem({
                  ...selectedCollectionItem,
                  isPreffered: value,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="ps-lg border-s border-borderPrimary">
        <div className="flex mb-8">
          <button
            type="button"
            className={`uppercase pb-md px-xl text-textInverse font-medium text-xs border-b border-transparent ${
              activeTab === "domains" && "!border-borderBrandLavender"
            }`}
            onClick={() => setActiveTab("domains")}
          >
            Domains
          </button>
          <button
            type="button"
            className={`uppercase pb-md px-xl text-textInverse font-medium text-xs border-b border-transparent  ${
              activeTab === "renew" && "!border-borderBrandLavender"
            }`}
            onClick={() => setActiveTab("renew")}
          >
            Renew
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[555px]">
            {activeTab === "domains" && domainsTabContent}
            {activeTab === "renew" && renewTabContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainManage;
