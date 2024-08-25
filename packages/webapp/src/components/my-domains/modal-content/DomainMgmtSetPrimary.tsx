import { Address, Hash, isAddressEqual, namehash } from "viem";
import { useAccount } from "wagmi";
import REGISTRY_ABI from "../../../abi/IRegistry";
import { Domain, Registry, useDomains } from "../../../services/graph";
import { useWriteContractWaitingForTx } from "../../../services/shared";
import { covertDateToHumanReadable } from "../../../utils/date";
import IconChevronUp from "../../icons/IconChevronUp";
import IconPersonCard from "../../icons/IconPersonCard";
import BadgePrimaryName from "../../ui/badges/BadgePrimaryName";

type Props = {
  registry: Registry;
};

export default function DomainMgmtSetPrimary(props: Props) {
  const account = useAccount();
  const domains = useDomains({
    cldId: props.registry.id,
    owner: account.address,
  });

  const setPrimary = useWriteContractWaitingForTx();
  function handleSetPrimary(domainId: Hash) {
    if (setPrimary.isLoading || !account.address) {
      return;
    }

    setPrimary.writeContract({
      abi: REGISTRY_ABI,
      address: props.registry.address,
      functionName: "setReverse",
      args: [
        BigInt(domainId),
        [BigInt(namehash("crypto.ETH.address"))],
        [account.address.toLowerCase()],
      ],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-xl w-full">
      <table>
        <thead>
          <tr>
            <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-md text-start leading-4">
              Name
            </th>
            {props.registry.hasExpiringNames && (
              <th className="text-textSecondary text-xs font-medium uppercase pb-sm pe-md text-start leading-4">
                Expires
              </th>
            )}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {domains.data?.map((item) => (
            <tr key={item.id} className="border-b border-borderPrimary">
              <td className="py-md pe-md">
                <div className="flex items-center gap-xs">
                  <img
                    src={`https://picsum.photos/200?random=${item.id}`}
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
              {props.registry.hasExpiringNames && (
                <td className="py-md pe-md">
                  <span className="text-sm text-textInverse font-medium">
                    {covertDateToHumanReadable(item.expiry || "0")}
                  </span>
                </td>
              )}
              <td className="py-md">
                {isPrimaryName(item, account.address) ? (
                  <BadgePrimaryName />
                ) : (
                  <button
                    type="button"
                    className="button-md button-secondary w-full justify-center"
                    disabled={setPrimary.isLoading}
                    onClick={() => handleSetPrimary(item.id)}
                  >
                    {setPrimary.isLoading ? "Loading..." : "Set as Primary"}
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
            {formatDomainsQuantity(domains.data?.length)}
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
}

function isPrimaryName(domain: Domain, address?: Address) {
  if (!address || !domain.resolvedAddress) {
    return false;
  }
  return isAddressEqual(domain.resolvedAddress, address);
}

function formatDomainsQuantity(quantity?: number) {
  if (!quantity) {
    return "";
  }
  return quantity > 1 ? `${quantity} Domains` : `${quantity} Domain`;
}
