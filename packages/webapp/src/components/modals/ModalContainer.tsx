import { useEffect } from "react";
import { createPortal } from "react-dom";
import IconX from "../icons/IconX";

const ModalContainer: React.FC<{
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> | ((isOpen: boolean) => void);
  title: string;
  children: React.ReactNode;
}> = ({ isModalOpen, setIsModalOpen, children, title }) => {
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);

  if (!isModalOpen) {
    return <></>;
  }

  const modalContent = (
    <div className="fixed inset-0 bg-surfacePrimary/50 z-50 flex items-end sm:items-center justify-center sm:p-sm">
      <div className="w-full sm:w-auto sm:min-w-[440px]">
        <div className="border border-borderPrimary rounded-32 relative">
          <div className="absolute inset-0 backdrop-blur-[12px] rounded-32 z-0 bg-modalContainerGradient"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-xs p-lg border-b border-borderPrimary">
              <h3 className="text-base text-textInverse font-medium">
                {title}
              </h3>
              <button
                type="button"
                className="button-secondary button-sm rounded-full"
                onClick={() => setIsModalOpen(false)}
              >
                <IconX />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-lg">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return <div>{createPortal(modalContent, document.body)}</div>;
};

export default ModalContainer;
