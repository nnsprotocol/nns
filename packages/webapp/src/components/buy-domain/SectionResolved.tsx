import IconArrowRight from "../icons/IconArrowRight";

const cardsList = [
  {
    id: "nouns",
    imgSrc: "/temp/resolved-section/nouns.svg",
    text: "Nouns DAO",
  },
  {
    id: "lil-nouns",
    imgSrc: "/temp/resolved-section/lil-nouns.svg",
    text: "Lil Noun DAO",
  },
  {
    id: "gnars",
    imgSrc: "/temp/resolved-section/gnars.svg",
    text: "Gnars",
  },
  {
    id: "guild",
    imgSrc: "/temp/resolved-section/guild.svg",
    text: "Guild.xyz",
  },
  {
    id: "gnars-2",
    imgSrc: "/temp/resolved-section/gnars.svg",
    text: "Gnars",
  },
  {
    id: "guild-2",
    imgSrc: "/temp/resolved-section/guild.svg",
    text: "Guild.xyz",
  },
];

function SectionResolved() {
  return (
    <section className="flex justify-center w-full">
      <a className="anchor" id="resolver"></a>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl lg:max-w-[1200px]">
        <div className="grid grid-cols-1 gap-lg">
          <p className="text-3xl text-textInverse font-semibold">
            Resolved in the Nouniverse and beyond
          </p>
          <p className="text-textSecondary text-lg font-medium leading-6 max-w-[550px]">
            NNS names are natively resolved in the Nouns ecosystem. Every
            resolver is part of the system and gains benefits and rewards.
          </p>
          <div className="mt-2xl grid grid-cols-1 md:grid-cols-2 gap-lg">
            {cardsList.map((item) => (
              <div
                key={item.id}
                className="p-md border border-borderPrimary rounded-3xl relative overflow-hidden bg-cardPrimaryGradient"
              >
                <div className="absolute inset-0 backdrop-blur-[30px] z-0"></div>
                <div className="flex items-center justify-between gap-lg relative z-10">
                  <div className="flex items-center gap-xs">
                    <div>
                      <img
                        src={item.imgSrc}
                        alt=""
                        className="w-12 h-12 rounded-xl"
                      />
                    </div>
                    <p className="text-lg text-textInverse font-medium">
                      {item.text}
                    </p>
                  </div>
                  <button type="button" className="button-secondary button-md">
                    <IconArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="button-secondary button-md">
            <span className="w-full text-center">Add NNS Resolver</span>
          </button>
        </div>
        <div className="hidden lg:flex justify-center items-center">
          <div className="h-96 w-96 bg-[url('/brand/decor-resolved-outer.svg')] bg-no-repeat bg-contain bg-center flex justify-center items-center relative">
            <div className="absolute inset-0 z-10 bg-surfacePrimary/50"></div>
            <img
              src="/brand/decor-resolved-inner.png"
              alt="Decor"
              width={199}
              height={199}
              className="animate-rotateLeftWithStops"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionResolved;
