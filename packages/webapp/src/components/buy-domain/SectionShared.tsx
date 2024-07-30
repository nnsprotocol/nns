import BadgeEarned from "../ui/badges/BadgeEarned";

function SectionShared() {
  return (
    <section className="grid grid-cols-1 gap-2xl">
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-lg">
          <p className="text-3xl text-textInverse font-semibold text-center">
            Shared by default
          </p>
          <p className="text-textSecondary text-lg font-medium leading-6 max-w-[550px]">
            NNS protocol shares its revenues with every actor of the system:
            From users to platforms that resolve NNS names.
          </p>
          <div className="flex justify-center">
            <button type="button" className="button-secondary button-md">
              Learn More
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="relative">
          <img src="/brand/shared-nouns.svg" alt="Shared nouns" className="h-[108px] w-auto" />
          <div className="absolute -top-6 right-0 md:-right-24">
            <BadgeEarned />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionShared;
