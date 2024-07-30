import React, { useState } from "react";
import { Brand } from "../../types/collection-details";
import SearchResultsList from "../search/SearchResultsList";

interface SectionSearchProps {
  brand: Brand;
}

const SectionSearch: React.FC<SectionSearchProps> = ({ brand }) => {
  const [isInputSearchFocused, setIsInputSearchFocused] = useState(false);
  const [isButtonSearchHovered, setIsButtonSearchHovered] = useState(false);

  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      setShowSearchResults(false);
    }
  };

  const handleSearchClick = () => {
    const element = document.getElementById(
      "collection-details-search-input"
    ) as HTMLInputElement;
    if (element && element.value) {
      setShowSearchResults(true);
    }
  };

  return (
    <div className="pt-10 w-full max-w-[484px]">
      <div className="flex justify-center relative">
        <div
          className="h-[88px] w-[88px] -mt-[44px] absolute bottom-100 left-50 z-0 rounded-full bg-cover bg-no-repeat"
          style={{
            boxShadow: "-13px -18px 8px 0px rgba(0, 0, 0, 0.40) inset",
            backgroundImage: `url(${brand.coinImageSrc})`,
            backgroundColor: "#04030F",
          }}
        ></div>
        <div
          className="h-[88px] w-[88px] -mt-[44px] absolute bottom-100 left-50 z-10 rounded-full bg-cover bg-no-repeat"
          style={{
            boxShadow: "-13px -18px 8px 0px rgba(0, 0, 0, 0.40) inset",
            backgroundImage: `url(${brand.coinImageSrc})`,
            backgroundColor: "#04030F",
          }}
        ></div>
      </div>
      <div
        className="p-lg pt-20 rounded-32 relative"
      >
        <div
          className="absolute bottom-[5px] left-[10px] h-[60px] w-3/4 z-0 border-b rounded-32 opacity-30"
          style={{ backgroundColor: brand.themeColor }}
        ></div>
        <div
          className="absolute inset-0 backdrop-blur-1xl z-0 rounded-32 border"
          style={{ borderColor: brand.themeColor }}
        ></div>
        <div className="relative z-10 grid grid-cols-1 gap-lg">
          <div className="flex justify-center">
            <img
              src="/logo-nouns.svg"
              alt="Logo nouns"
              className="h-5 w-auto"
            />
          </div>
          <div className="relative">
            <input
              id="collection-details-search-input"
              className="p-6 rounded-2xl border bg-transparent outline-none w-full text-lg font-light"
              placeholder="yourdomain (eg. bob.nouns)"
              style={{
                borderColor: isInputSearchFocused
                  ? brand.themeColor
                  : "#36353F",
              }}
              onInput={handleSearchInput}
              onFocus={() => setIsInputSearchFocused(true)}
              onBlur={() => setIsInputSearchFocused(false)}
            />
            <SearchResultsList showResults={showSearchResults} />
          </div>
          <div>
            <button
              type="button"
              className="text-base font-medium text-center p-md rounded-2xl w-full border"
              style={{
                color: isButtonSearchHovered
                  ? brand.themeColor
                  : brand.textColor,
                backgroundColor: isButtonSearchHovered
                  ? "#04030F"
                  : brand.themeColor,
                borderColor: isButtonSearchHovered
                  ? brand.themeColor
                  : "transparent",
              }}
              onMouseEnter={() => setIsButtonSearchHovered(true)}
              onMouseLeave={() => setIsButtonSearchHovered(false)}
              onClick={handleSearchClick}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSearch;
