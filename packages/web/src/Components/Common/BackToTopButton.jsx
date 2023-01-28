import { useState, useEffect } from "react";
// import { UpArrowIcon } from "./Icons";
const BackToTop = () => {
  const [showButton, setShowButton] = useState(false);
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });
  }, []);
  return (
    <div>
      {showButton && (
        <div
          className="topscroll d-flex justify-content-center align-items-center cursor-pointer"
          onClick={() => scrollToTop()}
        >
          <UpArrowIcon />
        </div>
      )}
    </div>
  );
};
export default BackToTop;
export const UpArrowIcon = () => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 17.5901L7.41 19.0001L12 14.4201L16.59 19.0001L18 17.5901L12 11.5901L6 17.5901Z"
        fill="white"
      />
      <path
        d="M6 11L7.41 12.41L12 7.83L16.59 12.41L18 11L12 5L6 11Z"
        fill="white"
      />
    </svg>
  );
};
