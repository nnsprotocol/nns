import { Goerli, useContractFunction, useEthers, useSendTransaction } from "@usedapp/core";
import * as ethers from 'ethers';
import React from "react";
import Header from "../Components/Common/Header";
import NoggleSlider from "../Components/NoggleSlider";
import h1Noggle from "../../src/assets/images/svg/h1_noggle.svg";
import smallSpectacle from "../../src/assets/images/svg/orangenoggle.svg";
import btnNoggle from "../../src/assets/images/svg/hero_btn_noggle.svg";
import hero_top_ellipse from "../../src/assets/images/png/hero_top_ellipse.png";
import herocenter from "../assets/images/png/herocenter.png";
import heroleft from "../assets/images/png/heroright.png";
import heronogleright from "../assets/images/png/herorleft.png";
import noggle999 from "../assets/images/svg/noggle999.svg";
import sidvish from "../assets/images/svg/sidvish.svg";
import gm from "../assets/images/svg/gm.svg";
import {
  TenKClubController
} from '@ensdomains/ens-contracts'

const Home = () => {

  const controller = new ethers.Contract("0x3c802c0000e936a7a39784a120C0Fb8A524A9901", TenKClubController)

  const { activateBrowserWallet, account, chainId, deactivate } = useEthers()  
  const { state, send, events } = useContractFunction(controller, 'register', { transactionName: 'Wrap', chainId: Goerli.chainId })

  const name = events?.[0]?.args[0];
  console.log('NAME', name)

  let href = null;
  if (state.status === 'Success' && name) {
    href = `https://app.nns.xyz/name/${name}.%E2%8C%90%E2%97%A8-%E2%97%A8/details`;
  }
  let action;
  switch(state.status) {
    case 'None':
      action = null;
      break

    case 'Success':
      action = `${name}.⌐◨-◨`;
      break

    default:
      action = state.status;
      break;
  }



  return (
    <>
      <Header />
      <Hero action={action} onClaim={() => {
        if (!account) {
          console.log('activate account')
          activateBrowserWallet();
          return
        }
        if (chainId !== Goerli.chainId) {
          alert("Only goerli")
          deactivate();
          return
        }
        console.log('SEND')
        send("0x063AFdADBAC8C97b6A1f8F9A52736203185021ba", account)
      }} href={href} />

      <NoggleSlider />
    </>
  );
};


const Hero = ({ onClaim, action, href }) => {
  return (
    <>
      <section className="d-flex align-items-center hero_bgi  overflow-hidden">
        <img
          className="position-absolute hero_top_overlay top-0 start-0"
          src={hero_top_ellipse}
          alt="hero_top_ellipse"
        />
        <div className="container_modified container index_1 py-5 mt-5 pb-lg-0 mt-lg-0 position-relative z_index">
          <div className="row flex-column-reverse flex-lg-row align-items-center justify-content-between pt-sm-5 mt-xxl-5  mt-4 pt-lg-0  position-relative">
            <div className="col-lg-5 mt-2 mt-lg-0 text-center text-lg-start">
              <h1 className="fw_xetrabold font_root font_xxl black mb-3">
                Claim your 10K
                <img
                  className="h1_img ms-2"
                  src={h1Noggle}
                  alt="spectacles"
                />{" "}
              </h1>
              <p className="pb-2 mb-4  fw_normal font_sm opacity_8 text-black font_root hero_para_width mx-auto mx-lg-0">
                You have won a 0000-9999
                <img
                  className="mx-1 mb-1 mb-sm-2 mw_purple"
                  src={smallSpectacle}
                  alt="smallSpectacle"
                />
                domain. Click the button below to claim yours!
              </p>
              <a
                className="fw_middium text-black font_xxs font_root text-decoration-none common_btn claim_btn d-inline-block py-3 px-4"
                style={{cursor: 'pointer'}}
                href={href || '#'}
                onClick={href ? null : (e) => {
                  e.preventDefault()
                  onClaim?.()
                }}
              >
                {
                  action || <>Claim Your 10K
                  <img className="mb-2 ms-1" src={btnNoggle} alt="btnNoggle" /></>
                }
                
              </a>
            </div>

            <div className="col-lg-6 d-flex justify-content-center">
              <div className="custom_htt">
                <div className="hero_noggle text-center">
                  <img
                    className="w-100 img_height object_fit_cover border_radius_15 trasastion_05 "
                    src={heroleft}
                    alt="HeroCardImg"
                  />
                  <div className="d-flex align-items-center pb-md-1 justify-content-center">
                    <h2 className="mb-1 pt-3 custom_ft fw_xetrabold   pink_color d-flex align-items-center font_root_bold">
                      1277
                      <img className="mw_noggle" src={gm} alt="gm" />
                    </h2>
                  </div>
                </div>

                <div className="hero_noggle_second">
                  <img
                    className="w-100 img_height object_fit_cover border_radius_15 trasastion_05 "
                    src={heronogleright}
                    alt="HeroCardImg"
                  />
                  <div className="d-flex align-items-center pb-md-1 justify-content-center">
                    <h2 className="mb-1 pt-3 custom_ft fw_xetrabold purple_color d-flex align-items-center font_root_bold">
                      7843 <img className="mw_noggle" src={sidvish} alt="" />
                    </h2>
                  </div>
                </div>

                <div className="hero_noggle_third ">
                  <img
                    className="w-100 img_height object_fit_cover border_radius_15 trasastion_05 "
                    src={herocenter}
                    alt="HeroCardImg"
                  />
                  <div className="d-flex align-items-center pb-md-1 justify-content-center">
                    <h2 className="mb-1 pt-3 custom_ft fw_xetrabold orange_color d-flex align-items-center font_root_bold">
                      9999
                      <img
                        className="mw_noggle"
                        src={noggle999}
                        alt="noggle999"
                      />
                    </h2>
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


export default Home;
