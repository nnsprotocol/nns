import IconChevronUp from "../icons/IconChevronUp";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import IconCheck from "../icons/IconCheck";

const dropdownItems = [
  { id: "nns", name: "NNS", imgSrc: "/temp/search-dropdown/nns.png" },
  { id: "nouns", name: "Nouns", imgSrc: "/temp/search-dropdown/nouns.png" },
  {
    id: "lil-nouns",
    name: "Lil Nouns",
    imgSrc: "/temp/search-dropdown/lil-nouns.png",
  },
  { id: "gnars", name: "Gnars", imgSrc: "/temp/search-dropdown/gnars.png" },
];

const DropdownSearch: React.FC = () => {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedDropdownItem] = useState("nns");

  useEffect(() => {
    setIsDropdownVisible(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownContentSection = (
    <div className="absolute top-100 right-0 py-1 z-30">
      <ul className="rounded-3xl border border-borderPrimary bg-surfacePrimary p-md">
        {dropdownItems.map((item) => (
          <li
            key={item.id}
            className="p-md gap-xs flex items-center min-w-[218px] hover:bg-surfaceSecondary"
          >
            <img
              src={item.imgSrc}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
            <span>{item.name}</span>
            {selectedDropdownItem === item.id && (
              <span className="ms-auto">
                <IconCheck />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

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
            backgroundImage: `url('/brand/nns-sunglasses.png')`,
          }}
        ></div>
        <span className="text-sm font-medium text-textInverse">NNS</span>
        <span
          className={`stroke-[#FBFFF4] transition-all ${
            isDropdownVisible ? "" : "rotate-180"
          }`}
        >
          <IconChevronUp color="#ffffff" />
        </span>
      </button>
      {isDropdownVisible && dropdownContentSection}
    </div>
  );
};

export default DropdownSearch;
