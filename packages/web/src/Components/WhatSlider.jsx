import React, { useState } from "react";
import Slider from "react-slick";
import blureright from "..//assets/images/png/blureright.png";
import blure from "..//assets/images/png/blure.png";
import whattop from "..//assets/images/png/whattop.png";
import noggle from "../assets/images/svg/orangenoggle.svg";
import whatrightbt from "..//assets/images/png/whatrightbt.png";
import { slideraboutdata } from "./Common/Helper";
import WhatSliderListItem from "./WhatSliderListItem";
import { SliderNextIcon, SliderPrevIcon } from "./Common/Icon";

const WhatSlider = () => {
  const [activeSlider, setActiveSlider] = useState(0);
  const sliderbutton = React.useRef(null);

  var settings = {
    dots: false,
    infinite: false,
    arrows: false,
    slidesToShow: 1,
    initialSlide: 0,
    fade: true,
    cssEase: "linear",
    afterChange: function (index) {
      setActiveSlider(index);
    },
  };

  return (
    <>
      <section className="what_bg d-flex flex-column justify-content-center py-5 py-lg-0 position-relative">
        <img
          className="position-absolute blureright"
          src={blureright}
          alt="blureright"
        />
        <img
          className="position-absolute blurleft"
          src={blure}
          alt="blureright"
        />
        <img
          className="position-absolute whatetop"
          src={whattop}
          alt="blureright"
        />
        <img
          className="position-absolute whatebottom"
          src={whatrightbt}
          alt="blureright"
        />
        <div className="container container_modified">
          <div className="row justify-content-center">
            <div className="col-10 col-sm-8 col-lg-6 order-lg-1 order-2 mt-4 mt-lg-0">
              <Slider ref={sliderbutton} {...settings}>
                {slideraboutdata &&
                  slideraboutdata.map((obj, index) => (
                    <WhatSliderListItem obj={obj} key={index} />
                  ))}
              </Slider>
              <div className="d-block d-lg-none mt-4">
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
                    activeSlider === 3 ? "slick-disabled slider_bg" : ""
                  }  custom_z ms-3 custom_sliderbtn border-0 d-flex align-items-center justify-content-center`}
                  onClick={() => sliderbutton?.current?.slickNext()}
                >
                  <SliderNextIcon />
                </div>
              </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 my-auto order-lg-2 order-1 text-center text-lg-start">
              <div className="ps-xl-5 custom_mh">
                <h2 className="small_heading text-black ft_ubuntu">
                  What do the 
                  <img className="noogle_represent" src={noggle} alt="noggle" />
                  <br className="d-none d-md-block" />
                  represent
                </h2>
                <p className="para font_root font_sm opacity-70 text-black">
                  {slideraboutdata[activeSlider].describe}
                </p>
              </div>
              <div className="d-none d-lg-block">
              <div className="d-flex ps-xl-5">
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
                    activeSlider === 3 ? "slick-disabled slider_bg" : ""
                  }  custom_z ms-3 custom_sliderbtn border-0 d-flex align-items-center justify-content-center`}
                  onClick={() => sliderbutton?.current?.slickNext()}
                >
                  <SliderNextIcon />
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhatSlider;
