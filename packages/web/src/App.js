import "./App.css";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useScreenFixedProvider } from "./Components/context/ScreenFixedProvider";
import BackToTopButton from "../src/Components/Common/BackToTopButton";
import Home from "./views/Home";
import Faq from "./views/Faq";

function App() {
  const { showOverlay } = useScreenFixedProvider();
  useEffect(() => {
    if (showOverlay) {
      document.body.classList.add("font_root");
    } else {
      document.body.classList.add("font_root");
    }
  }, [showOverlay]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faqs" element={<Faq />} />
      </Routes>
      <BackToTopButton />
    </>
  );
}

export default App;
