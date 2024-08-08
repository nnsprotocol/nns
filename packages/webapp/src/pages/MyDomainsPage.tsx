import { useMemo, useState } from "react";
import IconArrowRight from "../components/icons/IconArrowRight";
import IconChevronUp from "../components/icons/IconChevronUp";
import IconCopy from "../components/icons/IconCopy";
import IconInfo from "../components/icons/IconInfo";
import IconPlus from "../components/icons/IconPlus";
import LayoutDefault from "../components/layouts/LayoutDefault";
import DomainCollectionsCards from "../components/my-domains/DomainCollectionsCards";
import SearchResultsList from "../components/search/SearchResultsList";

function MyDomainsPage() {
  const [searchText, setSearchText] = useState("");

  const handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setSearchText(target.value);
  };

  const showSearchResults = useMemo(() => Boolean(searchText), [searchText]);

  const customSearchSection = (
    <div className="relative flex max-w-[435px] w-full">
      <div className="absolute inset-0 backdrop-blur-[7px] bg-surfaceSecondary/50 z-0 rounded-128"></div>
      <div className="relative z-10 flex items-center justify-between w-full border border-borderPrimary rounded-128 ps-md pe-xs bg-surfacePrimary">
        <input
          type="text"
          onInput={handleSearchInput}
          placeholder="Seach domain"
          className="p-xs h-12 w-full outline-none text-base bg-transparent"
        />
        <div className="flex items-center gap-xxs p-xxs pr-xs rounded-128 bg-surfaceSecondary">
          <div
            className="h-[24px] w-[24px] rounded-full bg-cover bg-no-repeat"
            style={{
              boxShadow: "-7px -7px 8px 0px rgba(0, 0, 0, 0.40) inset",
              backgroundImage: `url('/brand/nns-sunglasses.png')`,
            }}
          ></div>
          <span className="text-sm font-medium text-textInverse">NNS</span>
          <span className="rotate-180"><IconChevronUp color="#ffffff" /></span>
          
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <SearchResultsList showResults={showSearchResults} />
      </div>
    </div>
  );

  return (
    <LayoutDefault customSearchSection={customSearchSection}>
      <div className="mt-8 flex w-full">
        <div className="mx-auto grid grid-cols-1 gap-xl  w-full max-w-[1200px]">
          <div className="relative max-w-32">
            <img
              src="/temp/profile-lg.png"
              width={128}
              height={128}
              alt=""
              className="rounded-full"
            />
            <button
              type="button"
              className="flex items-center justify-center rounded-full button-brand-lavender h-7 w-7 absolute right-0 bottom-0"
            >
              <IconPlus />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-lg">
            <div>
              <p className="text-base font-medium mb-xs flex gap-xxs items-center">
                <span className="text-textBrandAquamarine">0x123...c5f6</span>
                <span className="text-textSecondary">known as</span>
              </p>
              <p className="text-textInverse text-3xl font-semibold my-xs">
                ciao.noun
              </p>
              <div className="flex gap-xxs items-center text-textSecondary text-base font-medium">
                <span>in</span>
                <span className="flex gap-xxs items-center px-xs text-textInverse stroke-textInverse">
                  <span>Nouns</span>
                  <span className="rotate-180">
                    <IconChevronUp />
                  </span>
                </span>
                <span>community</span>
                <span className="flex">
                  <IconInfo size={16} />
                </span>
              </div>
            </div>
            <div className="border border-borderPrimary rounded-3xl p-md bg-surfacePrimary grid grid-cols-1 gap-md min-w-[332px]">
              <div>
                <div className="border-b border-borderPrimary mb-xs pb-xs">
                  <div className="flex items-center justify-between mb-xs w-full text-sm font-medium">
                    <span className="text-textSecondary">Referral Rewards</span>
                    <span className="text-textInverse">105.23 NOGS</span>
                  </div>
                  <div className="flex items-center justify-end gap-xxs text-xs text-textSecondary font-medium">
                    <IconCopy />
                    <span>Share Referral</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-xs w-full text-sm font-medium">
                    <span className="text-textSecondary">Total Rewards</span>
                    <span className="total-rewards-text-gradient">
                      535.43 NOGS
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-xxs">
                    <a href="#" className="link-default text-xs">
                      <span>Learn More</span>
                      <IconArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1">
                <button
                  type="button"
                  className="button-md button-secondary justify-center"
                >
                  Claim All
                </button>
              </div>
            </div>
          </div>
          <DomainCollectionsCards />
        </div>
      </div>
    </LayoutDefault>
  );
}

export default MyDomainsPage;
