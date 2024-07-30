import { useState } from "react";
import SectionAbout from "../components/collection-details/SectionAbout";
import SectionBenefits from "../components/collection-details/SectionBenefits";
import SectionSearch from "../components/collection-details/SectionSearch";
import SectionSearchBackgroundPattern from "../components/collection-details/SectionSearchBackgroundPattern";
import { Brand } from "../types/collection-details";
import { Link, useParams } from "react-router-dom";

function CollectionDetailsPage() {
  const { collectionId } = useParams<{ collectionId: string }>();

  const brand: Brand = {
    themeColor: collectionId === "nns" ? "#86F9E4" : "#E9C80B",
    textColor: collectionId === "nns" ? "#000000" : "#000000",
    coinImageSrc: collectionId === "nns" ? "/temp/nns.svg" : "/temp/noun-1.svg",
  };

  const [connectWalletBackgroundColor, setConnectWalletBackgroundColor] = useState("#11101B");

  const handleMouseEnter = () => {
    if (window.scrollY > 0) {
      setConnectWalletBackgroundColor("#04030F");
    } else {
      setConnectWalletBackgroundColor(brand.themeColor);
    }
  };

  const handleMouseLeave = () => {
    setConnectWalletBackgroundColor("#11101B");
  };

  return (
    <div style={{ backgroundColor: brand.themeColor }}>
      <header className="px-4 max-w-screen-2xl sticky top-0 mx-auto w-full py-2 z-30">
        <div className="p-md overflow-hidden relative rounded-128">
          <div className="absolute inset-0 backdrop-blur-1xl bg-surfaceBrandBlue/10 z-0"></div>
          <div className="relative z-10 flex justify-between items-center">
            <Link className="block" to="/">
              <img
                src="/logo-nouns.svg"
                alt="Logo nouns"
                className="h-5 w-auto"
              />
            </Link>
            <div>
              <button
                type="button"
                className="button-secondary button-md"
                style={{ backgroundColor: connectWalletBackgroundColor }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-screen-2xl px-4 mx-auto w-full">
        <main className="bg-surfacePrimary text-textInverse rounded-48 relative p-4">
          <div className="hidden sm:block absolute inset-0 z-0">
            <SectionSearchBackgroundPattern themeColor={brand.themeColor} />
          </div>
          <div className="relative z-10 mb-16">
            <div className="flex justify-center items-center lg:min-h-[648px]">
              <SectionSearch brand={brand} />
            </div>
            <SectionBenefits brand={brand} />
            <SectionAbout brand={brand} />
          </div>
        </main>
      </div>

      <footer className="min-h-24"></footer>
    </div>
  );
}

export default CollectionDetailsPage;
