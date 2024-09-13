import { CollectionData } from "./types";

interface SectionBenefitsProps {
  collection: CollectionData;
}

const SectionBenefits: React.FC<SectionBenefitsProps> = ({ collection }) => {
  return (
    <section className="mt-4">
      <p className="text-textInverse text-center text-2.5xl my-2 font-semibold">
        {collection.benefits.header}
      </p>
      <div className="flex flex-col lg:flex-row gap-lg w-full justify-center mt-12 mb-10">
        <div className="w-full lg:max-w-[790px] border border-borderPrimary rounded-32 bg-cardSurfaceGradient p-lg">
          <p className="text-xs font-medium text-textInverse uppercase">Info</p>
          <img src={collection.benefits.imageSrc} alt="Nouns discover" />
          <div className="grid grid-cols-1 gap-md mt-5">
            <p className="text-2xl font-semibold my-1">
              {collection.benefits.title}
            </p>
            <p className="text-base font-medium text-textSecondary">
              {collection.benefits.description}
            </p>
          </div>
        </div>
        <div className="w-full lg:max-w-96 border border-borderPrimary rounded-32 bg-cardSurfaceGradient p-lg flex flex-col justify-between">
          <p className="text-xs font-medium text-textInverse uppercase mb-2">
            REVENUE DISTRIBUTION
          </p>
          {collection.benefits.revenues.map((item) => (
            <div key={item.name} className="pb-lg grid grid-cols-1 gap-xs">
              <div>
                <img
                  src={item.iconSrc}
                  className="w-[40px] h-[40px] rounded-full"
                  width={40}
                  height={40}
                  alt={item.name}
                />
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-base font-medium text-textInverse">
                  {item.name}
                </p>
                <p className="text-base font-medium text-textInverse">
                  {`${item.share}%`}
                </p>
              </div>
              <div className="rounded-xl h-[3px] bg-surfaceSecondary">
                <div
                  className="rounded-xl h-[3px] bg-textSecondary"
                  style={{
                    width: `${item.share}%`,
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
