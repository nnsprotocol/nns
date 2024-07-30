import { Brand } from "../../types/collection-details";
import IconChevronUp from "../icons/IconChevronUp";
import GroupSocialLinks from "../ui/groups/GroupSocialLinks";
interface SectionAboutProps {
  brand: Brand;
}

const SectionAbout: React.FC<SectionAboutProps> = ({ brand }) => {
  return (
    <section className="w-full lg:max-w-[1200px] border border-borderPrimary rounded-32 bg-cardSurfaceGradient p-lg m-auto">
      <div className="flex justify-between">
        <p className="text-xs font-medium text-textInverse uppercase">About</p>
        <GroupSocialLinks />
      </div>
      <div className="grid grid-cols-1 gap-lg pb-lg">
        <div className="grid grid-cols-1 gap-md">
          <div>
            <div className="my-6 flex justify-center">
              <img src={brand.coinImageSrc} width={100} height={100} alt="" />
            </div>
            <p className="text-2xl font-semibold my-1 text-center">Nouns</p>
          </div>
          <p className="text-base text-textSecondary text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="bg-surfaceSecondary rounded-2xl p-md flex flex-col items-center justify-center gap-sm justify-center">
              <p className="text-sm text-textSecondary font-medium">Registered Domains</p>
              <p className="text-2xl text-textInverse font-medium">1,234</p>
              <div className="flex gap-xxs items-center">
                <IconChevronUp />
                <span className="text-xs text-textSecondary font-medium">2.45% Past Week</span>
              </div>
            </div>
            <div className="bg-surfaceSecondary rounded-2xl p-md flex flex-col items-center justify-center gap-sm justify-center">
              <p className="text-sm text-textSecondary font-medium">Unique Owners</p>
              <p className="text-2xl text-textInverse font-medium">879</p>
              <div className="flex gap-xxs items-center">
                <IconChevronUp />
                <span className="text-xs text-textSecondary font-medium">1.08% Past Week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionAbout;
