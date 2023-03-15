import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Slide from "@mui/material/Slide";
import classes from "./MintingProgress.module.scss";
import Image from "next/image";
import { Box, Container } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MintingProgress = ({ open, handleClose, claimLoading }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (!claimLoading) {
          open && handleClose();
          return 0;
        }
        const diff = Math.random() * 5;
        return Math.min(oldProgress + diff, 95);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [handleClose, open, claimLoading]);

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
            <Image
              className={classes.logo_img}
              src="/logo.svg"
              alt="logo"
              width={278}
              height={32}
            />
            <Box sx={{ flexGrow: "1" }} />
          </Toolbar>
        </AppBar>
        <div className={classes.choose_wallet_container}>
          <h2>
            Hold on. We are generating your <br /> <span>Nounish Club</span>{" "}
            number
          </h2>
          <div className={classes.wallet_card_deck}>
            <h2>{progress.toFixed()}%</h2>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                backgroundColor: "#1F1F23",
                height: "10px",
                borderRadius: "1rem",
                "& .MuiLinearProgress-bar": {
                  background:
                    " linear-gradient(89.72deg, #9C4F96 0.23%, #FF6355 17.34%, #FBA949 34.44%, #FAE442 49.48%, #8BD448 69.69%, #2AA8F2 99.76%)",
                },
              }}
            />
          </div>
        </div>
      </Container>
    </Dialog>
  );
};

export default MintingProgress;
