import { useMemo, useState } from "react";
import IconArrowRight from "../icons/IconArrowRight";

const partners = [
  {
    name: "Nouns DAO",
    icon: "partners/nouns-dao.png",
    link: "https://nouns.wtf/",
  },
  {
    name: "Lil Nouns DAO",
    icon: "partners/lil-nouns-dao.png",
    link: "https://lilnouns.wtf/",
  },
  {
    name: "Gnars",
    icon: "partners/gnars.png",
    link: "https://www.gnars.wtf/",
  },
  {
    name: "Guild.xyz",
    icon: "partners/guild-xyz.png",
    link: "https://guild.xyz/explorer",
  },
  {
    name: "DAO Base",
    icon: "partners/dao-base.png",
    link: "https://daobase.ai/",
  },
  {
    name: "Voter.wtf",
    icon: "partners/voter-wtf.png",
    link: "https://voter.wtf",
  },
  {
    name: "Agora",
    icon: "partners/agora.png",
    link: "https://nounsagora.com/",
  },
  {
    name: "Federation",
    icon: "partners/federation.png",
    link: "https://www.federation.wtf/",
  },
  {
    name: "Alps DAO",
    icon: "partners/alps-dao.png",
    link: "https://alps.wtf/",
  },
  {
    name: "NounsBR",
    icon: "partners/nounsbr.png",
    link: "https://nounsbr.wtf/",
  },
  {
    name: "Public Nouns",
    icon: "partners/public-nouns.png",
    link: "https://publicnouns.wtf/",
  },
  {
    name: "Puppet Samurai",
    icon: "partners/puppet-samurai.png",
    link: "https://puppetsamurai.com/",
  },
  {
    name: "Auctions",
    icon: "partners/auctions.png",
    link: "https://auctions.wtf/",
  },
  {
    name: "Tings",
    icon: "partners/tings.png",
    link: "https://tings.wtf/",
  },
  {
    name: "Food Nouns",
    icon: "partners/food-nouns.png",
    link: "https://www.foodnouns.wtf/",
  },
  {
    name: "Wizards DAO",
    icon: "partners/wizards-dao.png",
    link: "https://wizardsdao.com/",
  },
  {
    name: "Dino Nouns",
    icon: "partners/dino-nouns.png",
    link: "https://dinonouns.xyz/",
  },
  {
    name: "Yolo Nouns",
    icon: "partners/yolo-nouns.png",
    link: "https://yolonouns.wtf/",
  },
];

function SectionResolved() {
  const [showAllPartners, setShowAllPartners] = useState(false);
  const filteredPartners = useMemo(() => {
    if (showAllPartners) {
      return partners;
    }
    return partners.slice(0, 6);
  }, [showAllPartners]);

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
            {filteredPartners.map((partner) => (
              <div
                key={partner.name}
                className="p-md border border-borderPrimary rounded-3xl relative overflow-hidden bg-cardPrimaryGradient"
              >
                <div className="absolute inset-0 backdrop-blur-[30px] z-0"></div>
                <div className="flex items-center justify-between gap-lg relative z-10">
                  <div className="flex items-center gap-xs">
                    <div>
                      <img
                        src={partner.icon}
                        alt=""
                        className="w-12 h-12 rounded-xl"
                      />
                    </div>
                    <p className="text-lg text-textInverse font-medium">
                      {partner.name}
                    </p>
                  </div>
                  <a
                    href={partner.link}
                    target="_blank"
                    className="button-secondary button-md"
                  >
                    <IconArrowRight />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="button-secondary button-md"
            onClick={() => setShowAllPartners(!showAllPartners)}
          >
            <span className="w-full text-center">
              {showAllPartners ? "Show less" : "Show all"}
            </span>
          </button>
          <button
            type="button"
            className="button-secondary button-md"
            onClick={() =>
              window.open(
                "https://docs.nns.xyz/for-devs/resolving-nns-names",
                "_blank"
              )
            }
          >
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
