import { useState } from "react";
import SearchResultsList from "../search/SearchResultsList";

function SectionIdentitySystem() {
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      setShowSearchResults(false);
    }
  };

  const handleSearchClick = () => {
    const element = document.getElementById(
      "buy-domain-search-input"
    ) as HTMLInputElement;
    if (element && element.value) {
      setShowSearchResults(true);
    }
  };
  return (
    <section className="lg:flex lg:justify-center lg:items-center gap-12 lg:min-h-[560px]">
      <div className="lg:max-w-2xl">
        <div className="text-6.5xl font-semibold">
          <span>
            <span>An open and shared Identity System </span>
            <br className="hidden lg:inline" /> for
          </span>

          <div className="inline-block ml-4">
            <div className="flex">
              <div className="bg-gradient-to-b from-surfaceBrandLavender from-30% to-surfaceBrandMauve p-[1px] rounded-128">
                <div className="p-md bg-surfaceSecondary rounded-128 min-w-44 flex justify-center">
                  <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-10">
        <div className="flex justify-center">
          <img
            src="/brand/glasses-in-circle-gradient.svg"
            alt="Glasses in circle"
            className="h-[88px] w-[88px] -mb-[44px] relative z-10"
          />
        </div>
        <div className="bg-gradient-to-b from-surfaceBrandLavender from-30% to-surfaceBrandMauve p-[1px] rounded-32">
          <div className="p-lg pt-20 rounded-32 relative lg:min-w-[484px]">
            <div className="absolute inset-0 backdrop-blur-1xl bg-surfacePrimaryGradient z-0 rounded-32"></div>
            <div className="relative z-10 grid grid-cols-1 gap-lg">
              <div className="flex justify-center">
                <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
              </div>
              <div className="relative">
                <input
                  id="buy-domain-search-input"
                  onInput={handleSearchInput}
                  className="p-6 rounded-2xl border border-borderSecondary bg-transparent outline-none w-full text-lg font-light focus:border-textBrandLavender"
                  placeholder="yourdomain (eg. bob.⌐◨-◨)"
                />
                <SearchResultsList showResults={showSearchResults} />
              </div>
              <div>
                <button
                  onClick={handleSearchClick}
                  type="button"
                  className="bg-surfaceBrandLavender text-textInverse text-base font-medium text-center p-md rounded-2xl w-full border border-surfaceBrandLavender hover:bg-surfacePrimary hover:text-surfaceBrandLavender"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionIdentitySystem;
