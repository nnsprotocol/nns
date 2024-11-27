import { useState } from "react";
import { Hash } from "viem";
import { useAccount } from "wagmi";
import { CollectionPreview, useCollectionPreview } from "../../services/graph";
import { useDefaultCld } from "../../services/resolver";
import ModalContainer from "../modals/ModalContainer";
import CollectionCard from "./CollectionCard";
import DomainMgmtModalContent from "./modal-content/DomainMgmtModalContent";

const DomainCollectionsCards: React.FC = () => {
  const account = useAccount();
  const collections = useCollectionPreview({
    owner: account.address,
  });
  const defaultCldId = useDefaultCld({
    account: account.address,
  });

  const [manageCldId, setManageCldId] = useState<Hash | null>(null);

  const handleManageClick = (item: CollectionPreview) => {
    setManageCldId(item.registry.id);
  };

  return (
    <>
      <div className="min-h-80 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
        {collections.data?.map((item) => (
          <CollectionCard
            key={item.registry.id}
            collection={item}
            defaultCldId={defaultCldId.data || 0n}
            onManageClick={() => handleManageClick(item)}
          />
        ))}
        <div className="min-h-80 group border border-borderPrimary rounded-32 bg-surfacePrimary p-lg flex justify-center items-center relative">
          <div className="absolute inset-0 rounded-32 z-0 overflow-hidden">
            <img
              src="/brand/more-collections-coming-soon/stroke-lavender.svg"
              width={346}
              height={53}
              className="w-auto"
            />
            <img
              src="/brand/more-collections-coming-soon/stroke-green.svg"
              width={241}
              height={59}
              className="w-auto"
            />
          </div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-surfaceInverse/1 z-10 rounded-32"></div>
          <div className="flex flex-col justify-center items-center gap-xl h-full pt-2xl relative z-20">
            <div className="relative">
              <img
                src="/temp/nns.svg"
                width={72}
                height={72}
                alt=""
                className="rounded-full relative z-10 bg-surfacePrimary"
              />
              <img
                src="/brand/more-collections-coming-soon/1.png"
                width={48}
                height={48}
                alt=""
                className="rounded-full absolute group-hover:top-[10px] group-hover:left-[10px] z-0 -top-full -left-full transition-all"
              />
              <img
                src="/brand/more-collections-coming-soon/2.png"
                width={44}
                height={44}
                alt=""
                className="rounded-full object-cover absolute group-hover:top-[10px] group-hover:left-[10px] z-0 -top-24 left-1 transition-all"
              />
              <span className="w-6 h-6 rounded-full border-2 border-textPrimary absolute group-hover:top-[10px] group-hover:left-[10px] z-0 -top-3/4 left-24 transition-all bg-surfaceBrandLavender"></span>
            </div>
            <p className="text-base font-medium text-textInverse">
              More communities coming soon!
            </p>
          </div>
        </div>
      </div>
      <ModalContainer
        isModalOpen={Boolean(manageCldId)}
        setIsModalOpen={() => setManageCldId(null)}
        title="Manage your names"
      >
        <DomainMgmtModalContent
          cldId={manageCldId!}
          onClose={() => setManageCldId(null)}
        />
      </ModalContainer>
    </>
  );
};

export default DomainCollectionsCards;
