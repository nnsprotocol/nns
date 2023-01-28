import React from "react";
import { Link } from "react-router-dom";
import pageLogo from "../../assets/images/svg/pageLogo.svg";
import boat from "../../assets/images/svg/boat.svg";
import twitter from "../../assets/images/svg/twitter.svg";
import gitHub from "../../assets/images/svg/git_hub.svg";
import heart from "../../assets/images/svg/heart.svg";
import footerLeftSpectacle from "../../assets/images/svg/footerLeftSpectacle.svg";
import footerRightSpectacle from "../../assets/images/svg/footerRightSspectacle.svg";

const Footer = () => {
  return (
    <>
      <footer className="position-relative">
        <div>
          <img
            className="position-absolute start-0 bottom-0 footer_left"
            src={footerLeftSpectacle}
            alt="footerLeftSpectacle"
          />
        </div>
        <div>
          <img
            className="position-absolute end-0 bottom-0 footer_left_bottom"
            src={footerRightSpectacle}
            alt="footerRightSpectacle"
          />
        </div>
        <div className="container_modified container py-5 index_1 position-relative">
          <div className="row align-items-center justify-content-between py-lg-2">
            <div className="col-lg-3 col-md-3 col-sm-6 mb-4 mb-sm-0">
              <div className="text-center text-sm-start">
                <Link to="/">
                  <img className="footer_logo" src={pageLogo} alt="pageLogo" />
                </Link>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="text-center text-sm-end text-xl-center">
                <a href="https://opensea.io/collection/nouns-name-service" target="_blank" rel="noreferrer">
                  <img className="footer_icon" src={boat} alt="boat" />
                </a>
                <a
                  className="mx-3 mx-2"
                  href="https://twitter.com/nnsprotocol"
                  target="_blank" rel="noreferrer"
                >
                  <img className="footer_icon" src={twitter} alt="twitter" />
                </a>
                <a href="https://github.com/nnsprotocol" target="_blank" rel="noreferrer">
                  <img className="footer_icon" src={gitHub} alt="gitHub" />
                </a>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-5 d-none d-md-block">
              <div className="d-flex align-items-center justify-content-end">
                <p className="m-0 font_xxs font_root opacity-70 text-black">Made with </p>
                <img className="mx-2 px-1" src={heart} alt="heart" />
                <p className="m-0 font_xxs font_root opacity-70 text-black" >in the Nouniverse.</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center text-center d-md-none mt-4 pt-2 pt-sm-0">
            <p className="m-0 font_xxs text-black opacity-70">Made with </p>
            <img className="mx-2 px-1" src={heart} alt="heart" />
            <p className="m-0 font_xxs text-black opacity-70">in the Nouniverse.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
