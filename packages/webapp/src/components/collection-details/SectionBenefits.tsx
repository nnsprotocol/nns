import { Brand } from "../../types/collection-details";
import { adjustColor } from "../../utils/color";
import IconWallet from "../icons/IconWallet";

interface SectionBenefitsProps {
  brand: Brand;
}

const SectionBenefits: React.FC<SectionBenefitsProps> = ({ brand }) => {
  const adjustedThemeColor = adjustColor(brand.themeColor);
  const revenueDistributionItems = [
    {
      id: "nouns-dao",
      imgSrc: brand.coinImageSrc,
      text: "Nouns DAO",
      revenueFraction: 90,
      themeColor: brand.themeColor,
    },
    {
      id: "ecosystem",
      imgSrc: "/temp/ecosystem.svg",
      text: "Ecosystem",
      revenueFraction: 7.5,
      themeColor: "#828187",
    },
    {
      id: "nns",
      imgSrc: "/temp/nns.svg",
      text: "NNS",
      revenueFraction: 2.5,
      themeColor: "#C496FF",
    },
  ];

  return (
    <section className="mt-4">
      <p className="text-textInverse text-center text-2.5xl my-2 font-semibold">
        Discover a growing set of benefits
      </p>
      <div className="flex flex-col lg:flex-row gap-lg w-full justify-center mt-12 mb-10">
        <div className="w-full lg:max-w-[790px] border border-borderPrimary rounded-32 bg-cardSurfaceGradient p-lg">
          <p className="text-xs font-medium text-textInverse uppercase">Info</p>
          <div className="flex justify-center items-center relative">
            <img
              src="/brand/nouns-discover.png"
              alt="Nouns discover"
              className="h-full max-h-[415px] w-auto object-cover"
            />
            <div
              className="absolute bottom-[59%] left-[48%] rounded-128 overflow-hidden"
              style={{
                background: `linear-gradient(270deg, ${brand.themeColor}80 0.31%, ${brand.themeColor}F4 95.62%)`,
                boxShadow: `0px 0px 24px 0px ${brand.themeColor}40`,
              }}
            >
              <div className="relative p-xs pe-md">
                <div className="absolute inset-0 backdrop-blur-[12px] z-0"></div>
                <div className="relative z-10 flex gap-xxs items-center">
                  <span
                    className="w-[40px] h-[40px] flex items-center justify-center rounded-full"
                    style={{ backgroundColor: adjustedThemeColor }}
                  >
                    <IconWallet />
                  </span>
                  <span className="text-2xl text-textInverse font-semibold">
                    $NOUNS
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-md">
            <p className="text-2xl font-semibold my-1">Lorem Ipsum</p>
            <p className="text-lg font-medium text-textSecondary">
              .nouns names are reserved to Nouns NFTs and $nouns token holders.
            </p>
          </div>
        </div>
        <div className="w-full lg:max-w-96 border border-borderPrimary rounded-32 bg-cardSurfaceGradient p-lg flex flex-col justify-between">
          <p className="text-xs font-medium text-textInverse uppercase mb-2">
            REVENUE DISTRIBUTION
          </p>
          {revenueDistributionItems.map((item) => (
            <div key={item.id} className="pb-lg grid grid-cols-1 gap-xs">
              <div>
                <img
                  src={item.imgSrc}
                  className="w-[40px] h-[40px] rounded-full"
                  width={40}
                  height={40}
                  alt={item.text}
                />
              </div>
              <p className="text-base font-medium text-textInverse">
                {item.text}
              </p>
              <div className="rounded-xl h-[3px] bg-surfaceSecondary">
                <div
                  className="rounded-xl h-[3px] bg-textSecondary"
                  style={{
                    width: `${item.revenueFraction}%`,
                    backgroundColor: item.themeColor,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionBenefits;
