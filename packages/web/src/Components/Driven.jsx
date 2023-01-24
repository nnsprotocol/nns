import React, { Fragment, useState } from "react";
import purple from "../assets/images/svg/orangenoggle.svg";
import driveArrow from "../assets/images/svg/driven_arrow.svg";
import { EcosystemData } from "./Common/Helper";
import { motion } from "framer-motion";

const Driven = () => {
  const [seeMoreData, setSeeMoreData] = useState(false);
  const clickHandler = () => {
    setSeeMoreData(!seeMoreData);
  };
  return (
    <>
      <section className="py-5 my-lg-4 my-lg-0">
        <div className="container_modified container py-lg-5">
          <p className="mb-2 pb-lg-1 orange fw_xetrabold font_root font_sm text-center pt-lg-4 mt-lg-3">
            Made for the culture
          </p>
          <h2 className="text-center fw_xetrabold text-black font_xl mb-2 pb-lg-1 lh-1 ft_ubuntu">
            Driven by a growing <br />{" "}
            <span className="orange ms-2"> ecosystem</span>
          </h2>
          <p className="pb-lg-2 mb-4 mb-lg-5 fw_normal font_xxs custom_clr font_root text-center mx-auto font_sm text-black ">
            <span className="opacity-70">
              {" "}
              Discover a growing network of partners who will natively resolve
              your
            </span>{" "}
            <img className="discover_img " src={purple} alt="purple" />
          </p>
          <div className="row mb-4 mb-lg-0">
            {EcosystemData &&
              EcosystemData.map((obj, i) => {
                return (
                  <Fragment key={i}>
                    {!seeMoreData && i > 7 ? (
                      ""
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: {
                            duration: 0.5,
                          },
                        }}
                        exit={{ opacity: 0 }}
                        className="col-lg-3 col-md-4 col-6 mb-4 mb-lg-5 pb-lg-1"
                        key={i}
                      >
                        <a
                          className="text-decoration-none"
                          target="_blank"
                          rel="noreferrer"
                          href={obj.link}
                        >
                          <div className="text-center driven_box cursor_pointer">
                            <div className="position-relative">
                              <img
                                className="w-100"
                                src={obj.img}
                                alt="driven3"
                              />
                              {i === 2 || i === 3 || i === 4 ? (
                                <button className="position-absolute start-50 top-50 translate-middle driven_btn border-0 text-decoration-none text-black fw_middium font_xxxs">
                                  coming soon
                                </button>
                              ) : (
                                ""
                              )}
                            </div>
                            <p className="font_sm fw_xetrabold font_root text-black text-center mt-2 mb-1 text-black">
                              {obj.heading}
                            </p>
                            <a
                              className=" text-decoration-none d-flex align-items-center justify-content-center hover_underline"
                              target="_blank"
                              rel="noreferrer"
                              href={obj.link}
                            >
                              <p className="font_xxs fw_middium font_root orange text-center mb-0 me-2">
                                {obj.text}
                              </p>
                              <img
                                className="w-100 mw_w"
                                src={driveArrow}
                                alt="driveArrow"
                              />
                            </a>
                          </div>
                        </a>
                      </motion.div>
                    )}
                  </Fragment>
                );
              })}
          </div>

          <div className="text-center mb-lg-4 pb-lg-2">
            <button
              className=" br_15 text-decoration-none text-black show_btn common_btn d-inline-block fw_middium font_xxs font_root_bold border-0"
              onClick={() => clickHandler()}
            >
              {seeMoreData ? "Show less" : "Show more"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Driven;
