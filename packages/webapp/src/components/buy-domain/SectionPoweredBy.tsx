import IconInbox from "../icons/IconInbox";
import IconMintStars from "../icons/IconMintStars";

function SectionPoweredBy() {
  return (
    <section className="-mx-4 bg-[url('/brand/pattern-tape.png')] bg-repeat-x bg-bottom min-h-[186px] py-9 px-4">
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl lg:max-w-[1200px]">
          <div className="flex items-center">
            <div className="grid grid-cols-1 gap-lg">
              <p className="text-3xl text-textInverse font-semibold">
                Powered by $NOGS
              </p>
              <p className="text-textSecondary text-lg font-medium leading-6 max-w-[587px]">
                NNS is fully integrated with $NOGS, a nounish currency. Get NOGS
                by joining NNS and use it to get the best of the nouniverse.
              </p>
              <div>
                <button type="button" className="button-secondary button-md">
                  <span className="w-full text-center">Discover NOGS</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-full md:max-w-[486px] border border-borderPrimary rounded-32 bg-[#04030f]/70 relative flex flex-col overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-[16px] z-0"></div>
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="p-lg border-b border-borderPrimary">
                  <p className="text-textInverse text-base font-medium">
                    Earn with NNS
                  </p>
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="p-lg flex items-center gap-xs border-b border-borderPrimary">
                    <IconInbox />
                    <p className="text-base font-medium flex gap-xxs">
                      <span className="text-textInverse">Earn</span>
                      <span className="text-textBrandLavender">NOGS</span>
                    </p>
                    <div className="text-base text-textSecondary font-medium ms-auto">
                      1,000 NOGS
                    </div>
                  </div>
                  <div className="p-lg flex items-center gap-xs border-b border-borderPrimary">
                    <IconInbox />
                    <p className="text-base font-medium flex gap-xxs">
                      <span className="text-textInverse">Earn</span>
                      <span className="text-textBrandLavender">NOGS</span>
                    </p>
                    <div className="text-base text-textSecondary font-medium ms-auto">
                      1,000 NOGS
                    </div>
                  </div>
                  <div className="p-lg flex items-center gap-xs border-b border-borderPrimary">
                    <IconMintStars />
                    <p className="text-base font-medium flex gap-xxs">
                      <span className="text-textInverse">Mint</span>
                      <span className="text-textBrandAquamarine">
                        NNS Identity
                      </span>
                    </p>
                    <div className="text-base text-textSecondary font-medium ms-auto">
                      bob.⌐◨-◨
                    </div>
                  </div>
                </div>
                <div className="p-lg border-t border-borderPrimary flex justify-between items-center gap-md">
                  <p className="text-textInverse text-base font-medium">
                    Balance
                  </p>
                  <div className="flex gap-xxs text-base font-medium">
                    <span className="balance-text-gradient">2,000.00</span>
                    <span className="text-textSecondary">NOGS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionPoweredBy;
