import { useState } from "react";
import SectionCards from "../components/buy-domain/SectionCards";
import SectionIdentitySystem from "../components/buy-domain/SectionIdentitySystem";
import SectionNamingSystem from "../components/buy-domain/SectionNamingSystem";
import SectionPoweredBy from "../components/buy-domain/SectionPoweredBy";
import SectionResolved from "../components/buy-domain/SectionResolved";
import SectionShared from "../components/buy-domain/SectionShared";
import IconArrowRight from "../components/icons/IconArrowRight";

const headerNavLinks = [
  { id: "header-link-1", href: "#", text: "WTF are" },
  { id: "header-link-2", href: "#", text: "Explore Ecosystem" },
  { id: "header-link-3", href: "#", text: "Join the Squad" },
  { id: "header-link-4", href: "#", text: "Earn Nogs" },
];

const footerSocialItems = [
  { id: "footer-social-1", src: "/social/social-1.svg" },
  { id: "footer-social-2", src: "/social/social-2.svg" },
  { id: "footer-social-3", src: "/social/social-3.svg" },
  { id: "footer-social-4", src: "/social/social-4.svg" },
];

function BuyDomainPage() {
  const [connectWalletBackgroundColor, setConnectWalletBackgroundColor] = useState("#11101B");

  const handleMouseEnter = () => {
    if (window.scrollY > 0) {
      setConnectWalletBackgroundColor("#04030F");
    } else {
      setConnectWalletBackgroundColor("#C496FF");
    }
  };

  const handleMouseLeave = () => {
    setConnectWalletBackgroundColor("#11101B");
  };

  return (
    <div className="bg-surfaceBrandBlue">
      <header className="px-4 max-w-screen-2xl sticky top-0 mx-auto w-full py-2 z-30">
        <div className="p-md overflow-hidden relative rounded-128">
          <div className="absolute inset-0 backdrop-blur-1xl bg-surfaceBrandBlue/10 z-0"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
            </div>
            <nav className="hidden lg:block">
              <ul className="flex space-x-lg">
                {headerNavLinks.map((item) => (
                  <li key={item.id}>
                    <a href={item.href} className="link-default">
                      <IconArrowRight />
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <button
                id="targetButton"
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
        <main className="bg-surfacePrimary text-textInverse p-4 rounded-48">
          <div className="grid grid-cols-1 gap-y-20 lg:gap-y-[300px] py-10 lg:py-20">
            <SectionIdentitySystem />
            <SectionCards />
            <SectionShared />
            <SectionResolved />
            <SectionNamingSystem />
            <SectionPoweredBy />
          </div>
        </main>
      </div>
      <footer className="bg-gradient-to-b from-surfaceBrandBlue from-30% to-surfaceBrandMauve">
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
                Let’s Start
              </p>
              <p className="text-lg text-surfacePrimary font-light text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco.
              </p>
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