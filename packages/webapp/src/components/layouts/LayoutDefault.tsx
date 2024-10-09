import { PropsWithChildren, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Registry, useRegistries, useSearchDomain } from "../../services/graph";
import SearchResultsList from "../search/SearchResultsList";
import BrandBackgroundPattern from "../ui/backgrounds/BrandBackgroundPattern";
import WalletButtonSection from "../wallet/WalletButtonSection";
import DropdownSearch from "./DropdownSearch";

type Props = PropsWithChildren<{
  defaultRegistry?: Registry;
}>;

const LayoutDefault: React.FC<Props> = ({ children, defaultRegistry }) => {
  const [searchText, setSearchText] = useState("");
  const registries = useRegistries();
  const [searchCld, setSearchCld] = useState<Registry | undefined>(
    defaultRegistry
  );
  useEffect(() => {
    if (defaultRegistry) {
      setSearchCld(defaultRegistry);
    }
    if (!defaultRegistry && !searchCld && registries.data?.length) {
      setSearchCld(registries.data[0]);
    }
  }, [defaultRegistry, searchCld, registries.data]);

  const search = useSearchDomain({
    name: searchText,
    cldId: searchCld?.id,
  });

  return (
    <>
      <div className="w-full bg-surfacePrimary relative">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <BrandBackgroundPattern themeColor="#C496FF" />
        </div>
        <div className="max-w-screen-2xl text-textInverse mx-auto relative">
          <header className="p-md flex gap-xs justify-between items-center sticky z-20 top-0">
            <Link to="/">
              <img src="/logo.svg" alt="Logo" className="sm:h-6 w-auto" />
            </Link>
            <div className="relative flex max-w-[435px] w-full">
              <div className="absolute inset-0 backdrop-blur-[7px] bg-surfaceSecondary/50 z-0 rounded-128"></div>
              <div className="relative z-10 flex items-center justify-between w-full border border-borderPrimary rounded-128 ps-md pe-xs bg-surfacePrimary">
                <input
                  type="text"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                  placeholder="Search name"
                  className="p-xs h-12 w-full outline-none text-base bg-transparent"
                />
                {registries.data && (
                  <DropdownSearch
                    registries={registries.data}
                    defaultSelection={searchCld}
                    onRegistryChange={(registry) => {
                      setSearchCld(registry);
                    }}
                  />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                {searchCld && (
                  <SearchResultsList
                    cldName={searchCld?.name}
                    domains={search.data || []}
                    searchText={searchText}
                    onClickAway={() => setSearchText("")}
                  />
                )}
              </div>
            </div>
            <WalletButtonSection />
          </header>
          <main className="relative z-10 min-h-screen px-4 pb-md">
            {children}
          </main>
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
            {/* <div>
              <GroupSocialLinks
                customLinkClassName="button-md py-0 px-1 flex items-center justify-center"
                iconSize={24}
              />
            </div> */}
          </div>
        </footer>
      </div>
    </>
  );
};

export default LayoutDefault;
