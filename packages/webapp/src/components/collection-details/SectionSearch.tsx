import React, { useState } from "react";
import { CollectionData } from "../../services/collections";
import { useRegistry, useSearchDomain } from "../../services/graph";
import SearchResultsList from "../search/SearchResultsList";

interface SectionSearchProps {
  collection: CollectionData;
}

const SectionSearch: React.FC<SectionSearchProps> = ({ collection }) => {
  const [isInputSearchFocused, setIsInputSearchFocused] = useState(false);
  const [isButtonSearchHovered, setIsButtonSearchHovered] = useState(false);

  const registry = useRegistry({ id: collection.cldId });
  const [searchText, setSearchText] = useState("");
  const search = useSearchDomain({
    name: searchText,
    cldId: collection.cldId,
  });

  return (
    <div className="pt-10 w-full max-w-[484px]">
      <div className="flex justify-center relative">
        <div
          className="h-[88px] w-[88px] -mt-[44px] absolute bottom-100 left-50 z-0 rounded-full bg-cover bg-no-repeat"
          style={{
            boxShadow: "-13px -18px 8px 0px rgba(0, 0, 0, 0.40) inset",
            backgroundImage: `url(${collection.logoSrc})`,
            backgroundColor: "#04030F",
          }}
        ></div>
        <div
          className="h-[88px] w-[88px] -mt-[44px] absolute bottom-100 left-50 z-10 rounded-full bg-cover bg-no-repeat"
          style={{
            boxShadow: "-13px -18px 8px 0px rgba(0, 0, 0, 0.40) inset",
            backgroundImage: `url(${collection.logoSrc})`,
            backgroundColor: "#04030F",
          }}
        ></div>
      </div>
      <div className="p-lg pt-20 rounded-32 relative">
        <div
          className="absolute bottom-[5px] left-[10px] h-[60px] w-3/4 z-0 border-b rounded-32 opacity-30"
          style={{ backgroundColor: collection.themeColor }}
        ></div>
        <div
          className="absolute inset-0 backdrop-blur-1xl z-0 rounded-32 border"
          style={{ borderColor: collection.themeColor }}
        ></div>
        <div className="relative z-10 grid grid-cols-1 gap-lg">
          <div className="flex justify-center">
            <img
              src={collection.nnsFontLogoUrl}
              alt="Logo nouns"
              className="h-5 w-auto"
            />
          </div>
          <div className="relative">
            <input
              id="collection-details-search-input"
              className="p-6 rounded-2xl border bg-transparent outline-none w-full text-lg font-light"
              placeholder={`Find your identity (eg. toady.${collection.cld})`}
              style={{
                borderColor: isInputSearchFocused
                  ? collection.themeColor
                  : "#36353F",
              }}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsInputSearchFocused(true)}
              onBlur={() => setIsInputSearchFocused(false)}
            />
            <SearchResultsList
              cldName={registry.data?.name || ""}
              domains={search.data || []}
              searchText={searchText}
              onClickAway={() => setSearchText("")}
            />
          </div>
          <div>
            <button
              type="button"
              className="text-base font-medium text-center p-md rounded-2xl w-full border"
              style={{
                color: isButtonSearchHovered
                  ? collection.themeColor
                  : collection.textColor,
                backgroundColor: isButtonSearchHovered
                  ? "#04030F"
                  : collection.themeColor,
                borderColor: isButtonSearchHovered
                  ? collection.themeColor
                  : "transparent",
              }}
              onMouseEnter={() => setIsButtonSearchHovered(true)}
              onMouseLeave={() => setIsButtonSearchHovered(false)}
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSearch;
