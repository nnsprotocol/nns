import { useCallback, useEffect, useRef, useState } from "react";
import SectionCards from "../components/buy-domain/SectionCards";
import SectionIdentitySystem from "../components/buy-domain/SectionIdentitySystem";
import SectionNamingSystem from "../components/buy-domain/SectionNamingSystem";
import SectionPoweredBy from "../components/buy-domain/SectionPoweredBy";
import SectionResolved from "../components/buy-domain/SectionResolved";
import SectionShared from "../components/buy-domain/SectionShared";
import IconArrowRight from "../components/icons/IconArrowRight";
import WalletButtonSection from "../components/wallet/WalletButtonSection";

const headerNavLinks = [
  { id: "header-link-1", href: "#share", text: "WTF" },
  { id: "header-link-2", href: "#resolver", text: "Explore Ecosystem" },
  { id: "header-link-3", href: "#naming", text: "Get in touch" },
  { id: "header-link-4", href: "#nogs", text: "Discover $NOGS" },
];

const footerSocialItems = [
  { id: "footer-x", src: "/social/x.svg" },
  { id: "footer-farcaster", src: "/social/farcaster.svg" },
  { id: "footer-github", src: "/social/github.svg" },
  { id: "footer-discord", src: "/social/discord.svg" },
];

function BuyDomainPage() {
  const [isContentUnderHeader, setIsContentUnderHeader] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);

  const handleScroll = useCallback(() => {
    setIsContentUnderHeader(window.scrollY >= 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="bg-surfaceBrandLavender">
      <header
        ref={headerRef}
        className="px-4 max-w-screen-2xl sticky top-0 mx-auto w-full py-2 z-30"
      >
        <div className="p-md relative rounded-128">
          <div className="absolute inset-0 backdrop-blur-1xl bg-surfaceBrandLavender/10 z-0 rounded-128"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
            </div>
            <nav className="hidden lg:block">
              <ul className="flex space-x-lg">
                {headerNavLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={
                        isContentUnderHeader
                          ? "link-brand-lavender transition-colors"
                          : "link-default transition-colors"
                      }
                    >
                      <IconArrowRight />
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <WalletButtonSection
                switchColors
                customConnectWalletButtonColors={{
                  hoverThemedBackgroundColor: "#C496FF",
                }}
              />
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-screen-2xl px-4 mx-auto w-full">
        <main className="bg-surfacePrimary text-textInverse p-4 rounded-48">
          <div className="grid grid-cols-1 px-4 gap-y-20 lg:gap-y-[300px] py-10 lg:py-20">
            <SectionIdentitySystem />
            <SectionCards />
            <SectionShared />
            <SectionResolved />
            <SectionNamingSystem />
            <SectionPoweredBy />
          </div>
        </main>
      </div>
      <footer className="bg-gradient-to-b from-surfaceBrandLavender from-30% to-surfaceBrandMauve">
        <div className="max-w-screen-2xl px-4 mx-auto w-full py-9 lg:pt-40">
          <div className="flex flex-col items-center gap-xl">
            <div>
              <img
                src="/footer-logo.svg"
                alt="Footer Logo"
                className="h-11 w-auto"
              />
            </div>
            <div className="grid grid-cols-1 gap-md  max-w-3xl">
              <p className="text-6.5xl text-textInverse font-semibold text-center">
                Find us here
              </p>
              {/* <p className="text-lg text-surfacePrimary font-light text-center">
                XXXX
              </p> */}
            </div>
            <div>
              <ul className="flex space-x-md">
                {footerSocialItems.map((item) => (
                  <li
                    key={item.id}
                    className="w-16 h-16 flex items-center justify-center bg-surfaceInverse rounded-xl"
                  >
                    <img src={item.src} alt={item.src} className="w-8 h-8" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-base font-normal lg:mt-24 mt-2xl flex items-center justify-center gap-xxs flex-wrap sm:flex-nowrap">
            <span>Made with</span>
            <img src="/brand/heart.svg" alt="Heart" className="h-6 w-auto" />
            <span>in the Nouniverse.</span>
            <span>Backed by Nouns</span>
            <img
              src="/brand/glasses.svg"
              alt="Glasses"
              className="h-6 w-auto"
            />
          </p>
        </div>
      </footer>
    </div>
  );
}

export default BuyDomainPage;
