import Head from "next/head";
import Header from "@/components/Header/Header";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import GradientBanner from "@/components/GradientBanner/GradientBanner";
import Proliferation from "@/components/Proliferation/Proliferation";
import WhatToDo from "@/components/WhatToDo/WhatToDo";
import FAQ from "@/components/FAQ/FAQ";
import Footer from "@/components/Footer/Footer";

import { useEthers } from "@usedapp/core";

import Backdrop from "@mui/material/Backdrop";
import FadeLoader from "react-spinners/FadeLoader";

export default function Home() {
  const { isLoading } = useEthers();

  return (
    <>
      <Head>
        <title>Spread the culture. Join the Nounish Club.</title>
        <meta
          name="description"
          content="The Nounish Club includes all the NNS numbers from 0 to 9999. 10k names which will be distributed to anyone, for free."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Union.svg" />
      </Head>

      <Header />
      <HeroBanner />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <FadeLoader color={"white"} loading={true} size={150} />
      </Backdrop>
      <GradientBanner />
      <Proliferation />
      <WhatToDo />
      <FAQ />
      <Footer />
    </>
  );
}
