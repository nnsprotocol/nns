import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SectionAbout from "../components/collection-details/SectionAbout";
import SectionBenefits from "../components/collection-details/SectionBenefits";
import SectionSearch from "../components/collection-details/SectionSearch";
import SectionSearchBackgroundPattern from "../components/collection-details/SectionSearchBackgroundPattern";
import { useCollectionData } from "../components/collection-details/types";
import WalletButtonSection from "../components/wallet/WalletButtonSection";

function CollectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const collection = useCollectionData(id);

  const navigate = useNavigate();
  useEffect(() => {
    if (!collection) {
      navigate("/");
    }
  }, [collection]);

  if (!collection) {
    return null;
  }

  return (
    <div style={{ backgroundColor: collection.themeColor }}>
      <header className="px-4 max-w-screen-2xl sticky top-0 mx-auto w-full py-2 z-30">
        <div className="p-md relative rounded-128">
          <div className="absolute inset-0 backdrop-blur-1xl bg-surfaceBrandLavender/10 z-0 rounded-128"></div>
          <div className="relative z-10 flex justify-between items-center">
            <Link className="block" to="/">
              <img
                src="/logo-nouns.svg"
                alt="Logo nouns"
                className="h-10 w-auto"
              />
            </Link>
            <div>
              <WalletButtonSection
                customConnectWalletButtonColors={{
                  hoverThemedBackgroundColor: collection.themeColor,
                }}
              />
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-screen-2xl px-4 mx-auto w-full">
        <main className="bg-surfacePrimary text-textInverse rounded-48 relative p-4">
          <div className="hidden sm:block absolute inset-0 z-0">
            <SectionSearchBackgroundPattern
              themeColor={collection.themeColor}
            />
          </div>
          <div className="relative z-10 mb-16">
            <div className="flex justify-center items-center lg:min-h-[648px]">
              <SectionSearch collection={collection} />
            </div>
            <SectionBenefits collection={collection} />
            <SectionAbout collection={collection} />
          </div>
        </main>
      </div>

      <footer className="min-h-24"></footer>
    </div>
  );
}

export default CollectionDetailsPage;
