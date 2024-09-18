import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Registry } from "../../services/graph";
import IconCheck from "../icons/IconCheck";
import IconChevronUp from "../icons/IconChevronUp";
import { getCollectionLogoURL } from "../../services/collections";

type Props = {
  registries: Registry[];
  defaultSelection?: Registry;
  onRegistryChange?: (registry: Registry) => void;
};

const DropdownSearch: React.FC<Props> = (props) => {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Registry | undefined>(
    props.defaultSelection
  );

  useEffect(() => {
    if (selectedItem) {
      props.onRegistryChange?.(selectedItem);
    }
  }, [selectedItem]);

  useEffect(() => {
    setIsDropdownVisible(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!props.registries || !selectedItem) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-xxs p-xxs pr-xs rounded-128 bg-surfaceSecondary"
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <div
          className="h-[24px] w-[24px] rounded-full bg-cover bg-no-repeat"
          style={{
            boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
            backgroundImage: `url('${getCollectionLogoURL(selectedItem.id)}')`,
          }}
        ></div>
        <span className="text-sm font-medium text-textInverse text-nowrap">
          {selectedItem.name}
        </span>
        <span
          className={`stroke-[#FBFFF4] transition-all ${
            isDropdownVisible ? "" : "rotate-180"
          }`}
        >
          <IconChevronUp color="#ffffff" />
        </span>
      </button>
      {isDropdownVisible && (
        <div className="absolute top-100 right-0 py-1 z-30">
          <ul className="rounded-3xl border border-borderPrimary bg-surfacePrimary p-md">
            {props.registries?.map((reg) => (
              <li
                key={reg.id}
                className="p-md gap-xs flex items-center min-w-[218px] hover:bg-surfaceSecondary"
                onClick={() => {
                  setSelectedItem(reg);
                  setIsDropdownVisible(false);
                }}
              >
                <img
                  src={getCollectionLogoURL(reg.id)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{reg.name}</span>
                {selectedItem?.id === reg.id && (
                  <span className="ms-auto">
                    <IconCheck />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownSearch;
