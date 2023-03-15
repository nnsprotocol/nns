import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./Proliferation.module.scss";

const Proliferation = () => {
  return (
    <Container>
      <div className={classes.proliferation_container}>
        <div>
          <h2>Let the proliferation begins</h2>
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
            The <span>Nounish Club</span> is reserved to the holders of a
            special category of NNS names: numbers. 10k of them. Only earnable
            through Proof of Proliferation.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Proliferation;
