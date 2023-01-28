import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import copy from "../assets/images/png/copy.png";

const Showing = () => {
  const copyHandler = (code) => {
    navigator.clipboard.writeText(code);
    toast("Noggles copied successfully!");
  };
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover66
        theme="light"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 text-center">
          <div className="d-flex align-items-center  flex-column flex-sm-row justify-content-sm-center mt-3 pt-sm-1">
            <h6 className="font_root_bold text-black fw_xetrabold mb-3 mb-sm-0 me-sm-3 pe-1 font_md">
              Wear your noggles
            </h6>
            <div className="copy_btn d-flex align-items-center">
              <img className="noogle_black" src={copy} alt="copy" />
              <button
                className="font_xxs fw_xetrabold font_root ms-2 text-black"
                onClick={() => copyHandler(".⌐◨-◨")}
              >
                {" "}
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Showing;
