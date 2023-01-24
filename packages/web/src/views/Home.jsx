import React from "react";
import Driven from "../Components/Driven";
import Hero from "../Components/Hero";
import Join from "../Components/Join";
import Prolifirate from "../Components/Prolifirate";
import Wating from "../Components/Wating";
import WhatSlider from "../Components/WhatSlider";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import NoggleSlider from "../Components/NoggleSlider";

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <NoggleSlider />
      <WhatSlider />
      <Driven />
      <Join />
      <Prolifirate />
      <Wating />
      <Footer />
    </>
  );
};

export default Home;
