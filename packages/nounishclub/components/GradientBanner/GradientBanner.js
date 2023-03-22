import classes from "./GradientBanner.module.scss";
const GradientBanner = () => {
  return (
    <div className={classes.gradient_wrapper}>
      <div className={classes.img_1}></div>
      <div className={classes.img_2}></div>
      <div className={classes.gradient_banner}></div>
    </div>
  );
};

export default GradientBanner;
