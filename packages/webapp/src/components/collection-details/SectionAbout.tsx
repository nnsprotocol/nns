import { CollectionData } from "../../services/collections";
import {
  calculateTotalSupply,
  calculateUniqueOwners,
  isNogglesCldId,
  useRegistry,
} from "../../services/graph";

interface SectionAboutProps {
  collection: CollectionData;
}

const SectionAbout: React.FC<SectionAboutProps> = ({ collection }) => {
  const registry = useRegistry({
    id: collection.cldId,
  });

  return (
    <div className="lg:max-w-[50%] p-lg border border-borderPrimary rounded-32 relative bg-cardPrimaryGradient">
      <div className="absolute inset-0 backdrop-blur-[8px] rounded-32 z-0"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-xs mb-xl">
          <p className="text-xs font-medium text-textInverse uppercase">
            About
          </p>
          {/* <GroupSocialLinks
                  customLinkClassName="button-md py-0 px-1 flex items-center justify-center"
                  iconSize={16}
                /> */}
        </div>
        <div className="grid grid-cols-1 gap-md">
          <div>
            <div className="my-6 flex justify-center">
              <img src={collection.logoSrc} width={72} height={72} alt="" />
            </div>
            <p className="text-2xl font-semibold my-1 text-center">
              {collection.name}
            </p>
          </div>
          <p className="text-base text-textSecondary text-center">
            {collection.description}
          </p>
          {isNogglesCldId(collection.cldId) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md bg-surfaceSecondary rounded-2xl p-md mt-xs">
              <div className="flex flex-col items-start justify-center gap-sm">
                <p className="text-sm text-textSecondary font-medium">
                  Registered Names
                </p>
                <p className="text-2xl text-textInverse font-medium">
                  {registry.data ? calculateTotalSupply(registry.data) : ""}
                </p>
                {/* <div className="flex gap-xxs items-center">
                        <IconChevronUp />
                        <span className="text-xs text-textSecondary font-medium">
                          <span className="text-[#19BB46]">2.45% </span>Past Week
                        </span>
                      </div> */}
              </div>
              <div className="flex flex-col items-start justify-center gap-sm">
                <p className="text-sm text-textSecondary font-medium">
                  Unique Owners
                </p>
                <p className="text-2xl text-textInverse font-medium">
                  {registry.data ? calculateUniqueOwners(registry.data) : ""}
                </p>
                {/* <div className="flex gap-xxs items-center">
                        <IconChevronUp />
                        <span className="text-xs text-textSecondary font-medium">
                          <span className="text-[#19BB46]">1.08% </span>Past Week
                        </span>
                      </div> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionAbout;
