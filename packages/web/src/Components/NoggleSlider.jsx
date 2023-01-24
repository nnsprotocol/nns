import React from "react";
import Slider from "react-slick";
import { SliderData } from "./Common/Data";
const NoggleSlider = () => {
  var settings = {
    dots: false,
    infinite: true,
    arrows: false,
    slidesToShow: 6,
    autoplaySpeed: 0,
    draggable: false,
    speed: 3000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 999,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
  return (
    <>
      <section className="header_sliderimg py-1">
        <Slider {...settings}>
          {SliderData.map((obj, index) => (
            <div key={index}>
              <div className="text-scroll align-items-center">
                <img
                  className="custom_img_slider"
                  src={obj.HeaderSliderimg}
                  alt="purplenoggle"
                />
              </div>
            </div>
          ))}
        </Slider>
      </section>
    </>
  );
};

export default NoggleSlider;
