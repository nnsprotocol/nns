import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./Proliferation.module.scss";

const Proliferation = () => {
  return (
    <Container>
      <div className={classes.proliferation_container}>
        <div>
          <h2>1 number powered by 10k</h2>
        </div>
        <div>
          <Image
            src="/nounish.gif"
            width={317}
            height={317}
            alt="animated_gif"
          />
        </div>
        <div>
          <p>
            The <span>Nounish Club</span> is reserved to the holders of the
            first 10k NNS numbers. 4 easy steps and you could get one of them
            and all the perks it comes with.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Proliferation;
