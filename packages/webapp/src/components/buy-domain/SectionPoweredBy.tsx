import { useMemo } from "react";
import IconInbox from "../icons/IconInbox";
import IconMintStars from "../icons/IconMintStars";

type Item = {
  id: string;
  type: string;
  coin: string;
  valueFormatted: string;
};

function SectionPoweredBy() {
  const items = useMemo<Item[]>(
    () => [
      {
        id: "list-item-1",
        type: "earn",
        coin: "NOGS",
        valueFormatted: "1,000 NOGS",
      },
      {
        id: "list-item-2",
        type: "earn",
        coin: "NOGS",
        valueFormatted: "1,000 NOGS",
      },
      {
        id: "list-item-3",
        type: "mint",
        coin: "NNS Identity",
        valueFormatted: "jp.⌐◨-◨",
      },
    ],
    []
  );

  return (
    <section className="-mx-4 bg-[url('/brand/pattern-tape.png')] bg-repeat-x bg-bottom min-h-[186px] py-9 px-4">
      <a className="anchor" id="nogs"></a>
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl lg:max-w-[1200px]">
          <div className="flex items-center">
            <div className="grid grid-cols-1 gap-lg">
              <p className="text-3xl text-textInverse font-semibold">
                Powered by $NOGS
              </p>
              <p className="text-textSecondary text-lg font-medium leading-6 max-w-[587px]">
                Fully integrated with $NOGS, NNS allows you to earn and spend
                this nounish currency to get the most out of the Nouniverse.
              </p>
              <div>
                <button type="button" className="button-secondary button-md">
                  <span className="w-full text-center">What is $NOGS</span>
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
                <div className="overflow-hidden">
                  <div className="flex-grow flex flex-col min-h-[267px] animate-earnWithNNSTranslate">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-lg flex items-center gap-xs border-b border-borderPrimary"
                      >
                        {item.type === "earn" && <IconInbox />}
                        {item.type === "mint" && <IconMintStars />}
                        <p className="text-base font-medium flex gap-xxs">
                          <span className="text-textInverse capitalize">
                            {item.type}
                          </span>
                          {item.type === "earn" && (
                            <span className="text-textBrandLavender">
                              {item.coin}
                            </span>
                          )}
                          {item.type === "mint" && (
                            <span className="text-textBrandAquamarine">
                              {item.coin}
                            </span>
                          )}
                        </p>
                        <div className="text-base text-textSecondary font-medium ms-auto">
                          {item.valueFormatted}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-lg border-t border-borderPrimary flex justify-between items-center gap-md">
                  <p className="text-textInverse text-base font-medium">
                    Balance
                  </p>
                  <div className="flex gap-xxs text-base font-medium">
                    <div className="overflow-hidden h-[20px]">
                      <div className="animate-earnWithNNSBalanceTranslate flex flex-col text-end">
                        <span className="balance-text-gradient leading-5">
                          2,000.00
                        </span>
                        <span className="balance-text-gradient leading-5">
                          1,000.00
                        </span>
                        <span className="balance-text-gradient leading-5">
                          0.00
                        </span>
                      </div>
                    </div>
                    <span className="text-textSecondary leading-5">NOGS</span>
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
