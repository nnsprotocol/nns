import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Slide from "@mui/material/Slide";
import classes from "./CompleteScreen.module.scss";
import Image from "next/image";
import { Box, Container } from "@mui/material";
import Link from "next/link";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CompleteScreen = ({ open, handleClose, registeredName }) => {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      PaperProps={{
        style: {
          backgroundColor: "#000000",
          boxShadow: "none",
        },
      }}
    >
      <Container>
        <AppBar
          sx={{ position: "relative", boxShadow: "none", padding: "1rem 0" }}
          color="transparent"
        >
          <Toolbar>
            <button onClick={handleClose} className={classes.logo_img_button}>
              <Image
                className={classes.logo_img}
                src="/logo.svg"
                alt="logo"
                width={278}
                height={32}
              />
            </button>
            <Box sx={{ flexGrow: "1" }} />
          </Toolbar>
        </AppBar>
        <div className={classes.choose_wallet_container}>
          <h2>
            Your Number in <span>Nounish Club</span>
          </h2>
          <h3>{registeredName}</h3>
          <div className={classes.wallet_card_deck}>
            <Image
              src="/nounish.gif"
              width={317}
              height={317}
              alt="animated_gif"
            />
            <Link
              href={`https://app.nns.xyz/name/${registeredName}.%E2%8C%90%E2%97%A8-%E2%97%A8/details`}
              className={classes.discord}
            >
              Manage
            </Link>
          </div>
        </div>
      </Container>
    </Dialog>
  );
};

export default CompleteScreen;
