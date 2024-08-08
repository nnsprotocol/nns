import { useMemo, useState } from "react";
import { DomainCollection, DomainItem } from "../../types/domains";
import CollectionCard from "./CollectionCard";
import ModalContainer from "../modals/ModalContainer";
import DomainManage from "./modal-content/DomainManage";
import DomainRenewSubmitted from "./modal-content/DomainRenewSubmitted";
import DomainRenewCompleted from "./modal-content/DomainRenewCompleted";

const DomainCollectionsCards: React.FC = () => {
  const collectionsList: DomainCollection[] = useMemo(
    () => [
      {
        id: "collection-1",
        name: "NNS",
        imgSrc: "/temp/nns-sunglasses.png",
        isPreffered: false,
        resolvingAs: "ciao.⌐◨-◨",
        domains: [
          {
            id: "domain-1",
            imgSrc: "/temp/domain-card.png",
            name: "ciao.⌐◨-◨",
            rewards: "-- NOGS",
            expires: "2025-06-10T00:00:00",
            isPrimary: true,
            price: 0.1,
          },
        ],
      },
      {
        id: "collection-2",
        name: "Nouns",
        imgSrc: "/temp/noun-1.svg",
        isPreffered: true,
        resolvingAs: "ciao.noun",
        domains: [
          {
            id: "domain-1",
            imgSrc: "/temp/domain-card.png",
            name: "ciao.noun",
            rewards: "-- NOGS",
            expires: "2025-06-10T00:00:00",
            isPrimary: true,
            price: 0.1,
          },
          {
            id: "domain-2",
            imgSrc: "/temp/domain-card.png",
            name: "hello.noun",
            rewards: "-- NOGS",
            expires: "2025-06-10T00:00:00",
            isPrimary: false,
            price: 0.1,
          },
          {
            id: "domain-3",
            imgSrc: "/temp/domain-card.png",
            name: "hola.noun",
            rewards: "-- NOGS",
            expires: "2025-06-10T00:00:00",
            isPrimary: false,
            price: 0.1,
          },
        ],
      },
    ],
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<
    "manage" | "manage-renew-submitted" | "manage-renew-completed"
  >("manage");
  const [selectedCollectionItem, setSelectedCollectionItem] =
    useState<DomainCollection | null>(null);
  const [submittedDomainItem, setSubmittedDomainItem] =
    useState<DomainItem | null>(null);

  const modalTitle = useMemo(() => {
    if (modalState === "manage") return "Manage";
    if (
      modalState === "manage-renew-completed" ||
      modalState === "manage-renew-submitted"
    )
      return "Renew";

    return "";
  }, [modalState]);

  const handleCloseButtonClick = () => {
    setIsModalOpen(false);
  };

  const handleManageClick = (collecitonItem: DomainCollection) => {
    if (collecitonItem) {
      setSelectedCollectionItem(structuredClone(collecitonItem));
      setIsModalOpen(true);
      setModalState("manage");
    }
  };

  const handleRenewSubmit = (item: DomainItem) => {
    setSubmittedDomainItem(item);
    setModalState("manage-renew-submitted");
    setTimeout(() => {
      setModalState("manage-renew-completed");
    }, 3000);
  };

  return (
    <>
      <div className="min-h-80 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
        {collectionsList.map((item) => (
          <CollectionCard
            key={item.id}
            collectionItem={item}
            handleManageClick={handleManageClick}
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
              More collections, coming soon!
            </p>
          </div>
        </div>
      </div>
      <ModalContainer
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={modalTitle}
      >
        {selectedCollectionItem && (
          <div>
            <div className={`${modalState === "manage" ? "block" : "hidden"}`}>
              <DomainManage
                selectedCollectionItem={selectedCollectionItem}
                setSelectedCollectionItem={setSelectedCollectionItem}
                handleRenewSubmit={handleRenewSubmit}
              />
            </div>
            <div
              className={`${
                modalState === "manage-renew-submitted" ? "block" : "hidden"
              }`}
            >
              {submittedDomainItem && (
                <DomainRenewSubmitted
                  submittedDomainItem={submittedDomainItem}
                  handleCloseButtonClick={handleCloseButtonClick}
                />
              )}
            </div>
            <div
              className={`${
                modalState === "manage-renew-completed" ? "block" : "hidden"
              }`}
            >
              {submittedDomainItem && (
                <DomainRenewCompleted
                  submittedDomainItem={submittedDomainItem}
                  handleCloseButtonClick={handleCloseButtonClick}
                />
              )}
            </div>
          </div>
        )}
      </ModalContainer>
    </>
  );
};

export default DomainCollectionsCards;
