import React, { useState } from "react";
import Slider from "react-slick";
import blacknoggle from "../assets/images/svg/orangenoggle.svg";
import prolifiratenoggle from "..//assets/images/svg/prolifiratenoggle.svg";
import prolifiratebottomnoggle from "..//assets/images/svg/prolifiratebottomnoggle.svg";
import { prolifirateData } from "./Common/Helper";
import { SliderNextIcon, SliderPrevIcon } from "./Common/Icon";
const Prolifirate = () => {
  const [activeSlider, setActiveSlider] = useState(0);
  const sliderbutton = React.useRef(null);
  var settings = {
    dots: false,
    infinite: false,
    initialSlide: 0,
    arrows: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplaySpeed: 3000,
    afterChange: function (index) {
      setActiveSlider(index);
    },
    responsive: [
      {
        breakpoint: 999,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 560,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const nextHandler = () => {
    sliderbutton?.current?.slickNext();
  };
  return (
    <>
      <section className="proliferate py-5 mt-5 position-relative">
        <img
          className="prolifirate_img top_noggle position-absolute"
          src={prolifiratenoggle}
          alt="prolifiratenoggle"
        />
        <img
          className="prolifirate_imgbottom position-absolute"
          src={prolifiratebottomnoggle}
          alt="prolifiratenoggle"
        />
        <div className="container container_modified pt-1 ">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <h2 className="min_heading mb-0 lh-1 mt-1 text-black ft_ubuntu">
                You proliferate. <br /> We{" "}
                <span className="orange">reward</span> you.
              </h2>
              <p className="font_root para  mt-3 mb-0 font_sm text-black">
                <span className="opacity-70">
                  As a proliferator you will be eligible for our weekly NNS
                  rewards.
                </span>{" "}
                <br className="d-none d-md-block" />{" "}
                <span className="opacity-70">Proudly show your </span>
                <img
                  className="blacknogggle me-1 pb-1"
                  src={blacknoggle}
                  alt="blacknoggle"
                />
                <span className=" opacity-70">
                  on social media and get nounish prizes, for life.
                </span>
              </p>
            </div>
          </div>
          <div className="row mt-lg-2 pb-lg-5 mb-lg-3">
            <div className="col-12 mb-lg-1 text-center">
              {console.log("prolifirateData", prolifirateData.length)}
              <Slider ref={sliderbutton} {...settings}>
                {prolifirateData.map((obj, index) => {
                  // console.log("asdasd", obj);
                  return (
                    <div className="proliferate_cards text-center" key={index}>
                      <div className="position-relative">
                        <img
                          className="w-100  "
                          src={obj.prolifirateImageUrl}
                          alt="card1"
                        />
                        <div className="text_tag position-absolute image_tags py-2  ">
                          <span className="text-white font_root fw-bold font-xxs d-inline-block">
                            {obj.text}
                          </span>
                        </div>
                      </div>
                      <h6 className="font_root_bold font_sm fw_xetrabold mt-4 pb-3 mb-0 text-black">
                        {obj.prolifirateHeading}{" "}
                      </h6>
                    </div>
                  );
                })}
              </Slider>

              <div className="d-flex ps-xl-5 justify-content-center">
                <div
                  className={`${
                    activeSlider === 0 ? "slick-disabled slider_bg" : ""
                  } custom_z me-1 custom_sliderbtn border-0 d-flex align-items-center justify-content-center`}
                  onClick={() => sliderbutton?.current?.slickPrev()}
                >
                  <SliderPrevIcon />
                </div>
                <div
                  className={`${
                    window.innerWidth > 575 && activeSlider === 11
                      ? "slick-disabled slider_bg"
                      : window.innerWidth < 575 && activeSlider === 14
                      ? "slick-disabled slider_bg"
                      : ""
                  }  custom_z ms-3 custom_sliderbtn border-0 d-flex align-items-center justify-content-center`}
                  onClick={() => nextHandler()}
                >
                  <SliderNextIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Prolifirate;
