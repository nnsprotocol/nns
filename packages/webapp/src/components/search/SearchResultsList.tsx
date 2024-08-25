import { Link } from "react-router-dom";
import BadgeAvailable from "../badges/BadgeAvailable";
import BadgeUnavailable from "../badges/BadgeUnavailable";
import IconArrowRight from "../icons/IconArrowRight";
import { Domain } from "../../services/graph";
import { normalize } from "viem/ens";
import { useEffect, useMemo, useRef } from "react";

interface Props {
  searchText: string;
  cldName: string;
  domains: Domain[];
  onClickAway?: () => void;
}

const SearchResultsList: React.FC<Props> = ({
  searchText,
  cldName,
  domains,
  onClickAway,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAvailable = useMemo(() => {
    return !domains
      ?.map((d) => d.name.split(".")[0])
      .some((d) => normalize(d) === normalize(searchText));
  }, [searchText, domains]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClickAway?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!searchText) {
    return <></>;
  }
  if (!domains?.length && !isAvailable) {
    return <></>;
  }

  return (
    <div ref={dropdownRef} className="absolute left-0 top-100 w-full py-2 z-20">
      <div className="border border-borderPrimary rounded-xl p-sm relative overflow-hidden">
        <div className="absolute inset-0 z-0 backdrop-blur-lg bg-surfacePrimary rounded-xl"></div>
        <div className="relative z-10">
          <p className="text-xs text-textSecondary font-medium mb-xs">
            Results
          </p>
          <ul className="grid grid-cols-1 gap-xs">
            {isAvailable ? (
              <li key={searchText}>
                <DomainLink
                  name={`${searchText}.${cldName}`}
                  available={true}
                />
              </li>
            ) : null}
            {domains.map((d) => (
              <li key={d.id}>
                <DomainLink name={d.name} available={false} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

function DomainLink(props: { name: string; available: boolean }) {
  return (
    <Link
      to={`/domain-overview/${props.name}`}
      className="flex gap-xs items-center hover:bg-surfaceSecondary px-xs py-sm rounded-lg"
    >
      <span className="text-sm text-textInverse font-normal">{props.name}</span>
      {props.available ? <BadgeAvailable /> : <BadgeUnavailable />}
      <span className="stroke-textSecondary ms-auto">
        <IconArrowRight size={16} />
      </span>
    </Link>
  );
}

export default SearchResultsList;
