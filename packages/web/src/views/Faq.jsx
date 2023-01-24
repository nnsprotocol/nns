import React, { useEffect } from "react";
// import { solutionData } from "../Components/Common/Helper";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import FaqData from "./FaqData";

const Faq = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <>
      <section className="pb-md-5">
        <div className="position-relative overflow-hidden faq_bg">
          <Header />
          <div className="pt-5 mt-4">
            <h2 className="px-2 position-relative index_1 fw_xetrabold text-center black  fs_6xl my-md-5 py-5 mb-0 ft_ubuntu">
              Frequently <span className="orange">asked</span> questions
            </h2>
          </div>
        </div>
        <div className="container mb-lg-5 py-lg-5">
          <div className="py-5 py-md-4 row align-items-center justify-content-center">
            <div className="col-xxl-8 col-lg-10 col-md-11">
              <div className="nns_accordian">
                <FaqData />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Faq;
