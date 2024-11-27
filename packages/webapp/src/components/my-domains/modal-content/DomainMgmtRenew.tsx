import { useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import {
  CONTROLLER_ADDRESS,
  useDomainPrice,
} from "../../../services/controller";
import { Domain, Registry, useDomains } from "../../../services/graph";
import { covertDateToHumanReadable } from "../../../utils/date";
import { formatETH, formatUSD } from "../../../utils/formatter";
import IconArrowRight from "../../icons/IconArrowRight";
import IconChevronUp from "../../icons/IconChevronUp";
import IconMinus from "../../icons/IconMinus";
import IconPersonCard from "../../icons/IconPersonCard";
import IconPlus from "../../icons/IconPlus";
import { useWriteContractWaitingForTx } from "../../../services/shared";
import CONTROLLER_ABI from "../../../abi/IController";
import DomainRenewSubmitted from "./DomainRenewSubmitted";
import DomainRenewCompleted from "./DomainRenewCompleted";
import { getDomainImageURL } from "../../../utils/metadata";

type Props = {
  registry: Registry;
  onClose: () => void;
};

export default function DomainMgmtRenew(props: Props) {
  const account = useAccount();
  const domains = useDomains({
    cldId: props.registry.id,
    owner: account.address,
  });
  const [renewalData, setRenewalData] = useState<Exclude<
    Parameters<typeof DomainRenewSubmitted>[0],
    "txHash"
  > | null>(null);

  const renew = useWriteContractWaitingForTx();
  function handleRenew(
    domain: Domain,
    years: number,
    price: { eth: bigint; usd: bigint }
  ) {
    setRenewalData({
      domain,
      years,
      priceETH: formatETH(price.eth),
      priceUSD: formatUSD(price.usd),
    });
    renew.writeContract({
      abi: CONTROLLER_ABI,
      address: CONTROLLER_ADDRESS,
      functionName: "renew",
      args: [domain.name.split("."), years],
      value: (price.eth * 11n) / 10n,
    });
  }

  if (renew.state.value === "minting" && renewalData) {
    return <DomainRenewSubmitted {...renewalData} txHash={renew.state.hash} />;
  }
  if (renew.state.value === "success" && renewalData) {
    return (
      <DomainRenewCompleted
        {...renewalData}
        txHash={renew.state.hash}
        onClose={props.onClose}
      />
    );
  }

  return (
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
          {domains.data?.map((item) => (
            <DomainRow
              key={item.id}
              domain={item}
              registry={props.registry}
              onRenew={handleRenew}
            />
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

type DomainRowProps = {
  domain: Domain;
  registry: Registry;
  onRenew: (
    domain: Domain,
    years: number,
    price: { eth: bigint; usd: bigint }
  ) => void;
};

function DomainRow(props: DomainRowProps) {
  const [years, setYears] = useState(1);
  const chainId = useChainId();
  const unitPrice = useDomainPrice({
    cldId: props.registry.id,
    name: props.domain.name,
  });
  const price = useMemo(() => {
    if (!unitPrice) {
      return null;
    }
    return {
      eth: unitPrice.eth * BigInt(years),
      usd: unitPrice.usd * BigInt(years),
    };
  }, [unitPrice?.eth, unitPrice?.usd, years]);

  return (
    <tr key={props.domain.id} className="border-b border-borderPrimary group">
      <td className="py-md pe-xs">
        <div className="flex items-center gap-xs">
          <img
            src={getDomainImageURL(chainId, props.domain)}
            width={72}
            height={72}
            className="rounded-lg border border-borderPrimary"
            alt=""
          />
          <div className="grid grid-cols-1 gap-xs">
            <span className="text-textInverse text-sm font-medium">
              {props.domain.name}
            </span>
            <span className="text-xs text-textSecondary font-medium">
              {covertDateToHumanReadable(props.domain.expiry || "0")}
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
              onClick={() => setYears(Math.max(1, years - 1))}
            >
              <IconMinus />
            </button>
            <span className="px-xs min-w-3 text-center text-xs text-textSecondary font-medium group-hover:text-textInverse">
              {years}
            </span>
            <button
              type="button"
              className="button-secondary button-sm rounded-full"
              onClick={() => setYears(years + 1)}
            >
              <IconPlus />
            </button>
          </div>
        </div>
      </td>
      <td className="py-md px-xs">
        <div className="text-end text-textSecondary font-medium">
          <div className="mb-xs text-sm group-hover:text-textBrandLavender">
            {price?.usd ? formatUSD(price?.usd) : ""}
          </div>
          <div className="text-xs group-hover:text-textInverse">
            {price?.eth ? formatETH(price?.eth) : ""}
          </div>
        </div>
      </td>
      <td className="py-md">
        <div className="flex justify-end">
          {Boolean(price) && (
            <button
              type="button"
              className="button-sm bg-surfaceSecondary stroke-surfacePrimary border border-surfaceSecondary group-hover:button-brand-lavender rounded-full"
              onClick={() => props.onRenew(props.domain, years, price!)}
            >
              <IconArrowRight />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function formatDomainsQuantity(quantity?: number) {
  if (!quantity) {
    return "";
  }
  return quantity > 1 ? `${quantity} Names` : `${quantity} Name`;
}
