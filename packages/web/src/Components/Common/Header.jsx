import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import pageLogo from "../../assets/images/svg/pageLogo.svg";

const Header = () => {
  const location = useLocation();
  const path = location.pathname;
  let value = window.pageYOffset;
  const [position, setPosition] = useState(value);
  const [, setVisible] = useState(true);
  const [, setScrollPosition] = useState(0);

  // TO FIND SCROLL Y POSITION
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };
  // THIS USEFFECT GIVE US POSITION OF SCROLL IN EVERY PIXELS WE SCROLL
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // THIS USEFFECT GIVE US POSITION OF SCROLL IN EVERY PIXELS WE SCROLL
  useEffect(() => {
    const handleScroll = () => {
      let moving = window.pageYOffset;
      setVisible(position > moving);
      setPosition(moving);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <>
      <nav className={`position-fixed top_0 start-0 end-0 fixed_navbar`}>
        <div
          className={`${
            position > 500 && "gradient_navbar"
          } header_bgc d-flex w-100 index_999`}
        >
          <div className=" w-100 position-relative header_bgc">
            <div className="container container_modified d-flex justify-content-between align-items-center py-3 py-lg-4">
              <div className="cursor_pointer">
                <Link to="/">
                  <img
                    className="pagelogo_width"
                    src={pageLogo}
                    alt="pageLogo"
                  />
                </Link>
              </div>
              <div className="d-flex align-items-center">
                <Link
                  to="/faqs"
                  className={`text-decoration-none underline_hover me-2 pe-2 opacity_8 fw_normal font_sm font_root gradient_border_after position-relative ${
                    path === "/faqs" ? "orange" : "text-black"
                  }`}
                >
                  FAQ
                </Link>
                {path === "/faqs" ? (
                  ""
                ) : (
                  <a
                    href="https://app.nns.xyz"
                    target="_blank"
                    rel="noreferrer"
                    className="br_15 text-decoration-none text-black header_btn common_btn ms-sm-5  d-inline-block fw_middium font_xxs font_root"
                  >
                    Launch app
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
