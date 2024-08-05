import { useMemo, useState } from "react";
import SearchResultsList from "../search/SearchResultsList";
import BrandBackgroundPattern from "../ui/backgrounds/BrandBackgroundPattern";
import GroupSocialLinks from "../ui/groups/GroupSocialLinks";
import { Link } from "react-router-dom";
import WalletButtonSection from "../wallet/WalletButtonSection";

const LayoutDefault: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setSearchText(target.value);
  };

  const showSearchResults = useMemo(() => Boolean(searchText), [searchText]);

  return (
    <>
      <div className="w-full bg-surfacePrimary relative">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <BrandBackgroundPattern themeColor="#C496FF" />
        </div>
        <div className="max-w-screen-2xl text-textInverse mx-auto relative">
          <header className="p-md flex gap-xs justify-between items-center sticky z-20 top-0">
            <Link className="hidden sm:block" to="/">
              <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
            </Link>
            <div className="relative flex max-w-[435px] w-full">
              <div className="absolute inset-0 backdrop-blur-[7px] bg-surfaceSecondary/50 z-0 rounded-128"></div>
              <div className="absolute top-0 left-0 bottom-0 p-xs z-10">
                <img
                  src="/brand/noun-search.svg"
                  alt="Noun"
                  width={32}
                  height={32}
                />
              </div>
              <input
                type="text"
                onInput={handleSearchInput}
                placeholder="Seach domain"
                className="p-xs ps-12 border border-borderSecondary focus:border-borderBrandLavender rounded-128 h-12 w-full outline-none text-base relative z-10 bg-transparent"
              />
              <div className="absolute bottom-0 left-0 right-0">
                <SearchResultsList showResults={showSearchResults} />
              </div>
            </div>
            <WalletButtonSection />
          </header>
          <main className="relative z-10 min-h-screen px-4 pb-md">{children}</main>
        </div>
        <footer className="border-t border-borderSecondary">
          <div className="max-w-screen-2xl text-textInverse mx-auto relative p-xl flex flex-col md:flex-row items-center justify-between gap-xl">
            <div>
              <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
            </div>
            <div>
              <p className="text-base font-medium flex items-center justify-center gap-xxs flex-wrap sm:flex-nowrap">
                <span>Made with</span>
                <img
                  src="/brand/heart.svg"
                  alt="Heart"
                  className="h-6 w-auto"
                />
                <span>in the Nouniverse.</span>
                <span>Backed by Nouns</span>
                <img
                  src="/brand/glasses.svg"
                  alt="Glasses"
                  className="h-4 w-auto"
                />
              </p>
            </div>
            <div>
              <GroupSocialLinks
                customLinkClassName="button-md py-0 px-1 flex items-center justify-center"
                iconSize={24}
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LayoutDefault;
