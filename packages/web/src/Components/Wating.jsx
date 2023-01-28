import React from "react";
import greennoggle from "..//assets/images/png/greennoggle.png"
import chrome from "..//assets/images/png/chrome.png"
import docs from "..//assets/images/png/docs.png"
import overlay from "../assets/images/png/overlay.png"
import discord from "..//assets/images/png/discord.png"
const Wating = () => {
  return <>
    <section className="py-2">
    <div className="container my-lg-5 py-5">
      <div className="text-center">
        <h2 className="min_heading text-black ft_ubuntu">We are waiting for <span className="orange"> you </span></h2>
      </div>
      <div className="row justify-content-center mt-5 pt-1">
        <div className="col-6 col-md-4 col-xl-3">
          <a className="text-decoration-none text-black" href="https://app.nns.xyz" target="_blank" rel="noreferrer">
          <div className="waiting_card mx-auto text-center h-100 cursor_pointer">
            <img className="pb-1 green_noggle" src={greennoggle} alt="greennoggle" />
            <h6 className="font_md fw fw_xetrabold mt-4 pt-sm-2 font_root_bold text-black">Claim Your Name</h6>
          </div>
          </a>
        </div>
        <div className="col-6 col-md-4 col-xl-3">
          <a className="text-decoration-none text-black" href="https://chrome.google.com/webstore/detail/nouns-name-service-nns/ohbfcjnbjhbpmbafkcladfbblfncmaia/" target="_blank" rel="noreferrer">
          <div className="chrom_card waiting_card mx-auto text-center h-100 cursor_pointer">
            <img className="pb-1 chrome_img" src={chrome} alt="chrome" />
            <h6 className="font_md fw fw_xetrabold mt-3 mt-sm-4 mb-0 font_root_bold text-black">Install Extension</h6>
          </div>
          </a>
        </div>
      </div>
      <div className="row justify-content-center mt-4 pt-1 mb-4 pb-2">
        <div className="col-6 col-md-4 col-xl-3 ">
          <div className="docs_card waiting_card mx-auto text-center h-100 position-relative overflow-hidden">
            <button className="readbtn_custom position-absolute text-black border-0 fw_bold font_xxxs">coming soon</button>
          <img className="card_overlay position-absolute" src={overlay} alt="overlay" />
            <img className="pb-1 docs_img" src={docs} alt="docs" />
            <h6 className="font_md fw fw_xetrabold mt-3 mt-sm-4 pt-sm-2 font_root_bold text-black">Read Our Doc</h6>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-3">
          <a className="text-black text-decoration-none" href="http://discord.gg/pnDEEK2caX" target="_blank" rel="noreferrer">
          <div className="discord_card waiting_card mx-auto text-center h-100 cursor_pointer">
            <img className="pb-1 chrome_img" src={discord} alt="discord" />
            <h6 className="font_md fw fw_xetrabold mt-3 mt-sm-4 mb-0 pt-sm-1 font_root_bold text-black">Meet The Squad</h6>
          </div>
          </a>
        </div>
      </div>
    </div>
    </section>
    </>;
};

export default Wating;
