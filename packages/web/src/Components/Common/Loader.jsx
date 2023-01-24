import React from "react";
// import loader from "../../assets/img/png/preloader-img.png";

const Loader = ({ size }) => {
  return (
    <>
      <div className="loader-fullscreen" style={{ height: `${[size[1]]}px` }}>
        {/* <img className="loader-img" src={loader} alt="heroSnailImage" /> */}
        <h1>loader</h1>
      </div>
    </>
  );
};

export default Loader;
