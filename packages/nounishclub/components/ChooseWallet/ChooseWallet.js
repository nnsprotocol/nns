import * as React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import classes from "./ChooseWallet.module.scss";
import Image from "next/image";
import { Box, Container } from "@mui/material";
import { useEthers } from "@usedapp/core";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const walletList = [
  {
    image: "metamask.svg",
    height: 30,
    width: 32,
    title: "MetaMask",
    desc: "Connect to your MetaMask Wallet",
  },
  {
    image: "coinbase.svg",
    height: 30,
    width: 30,
    title: "Coinbase Wallet",
    desc: "Scan with Coinbase Wallet to connect",
  },
  {
    image: "wallet_connect.svg",
    height: 30,
    width: 30,
    title: "WalletConnect",
    desc: "Scan with WalletConnect to connect",
  },
  {
    image: "portis.svg",
    height: 20,
    width: 30,
    title: "Portis",
    desc: "Connect with your Portis account",
  },
  {
    image: "torus.svg",
    height: 22,
    width: 24,
    title: "Torus",
    desc: "Connect with your Torus account",
  },
];

export default function ChooseWallet({ open, handleClose }) {
  const { activateBrowserWallet } = useEthers();

  const handleConnectWallet = () => {
    activateBrowserWallet();
    handleClose();
  };

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
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.choose_wallet_container}>
          <h2>Choose your wallet</h2>
          <div className={classes.wallet_card_deck}>
            {walletList.map((wallet) => (
              <div className={classes.wallet_card} key={wallet.title}>
                <Image
                  src={wallet.image}
                  height={wallet.height}
                  width={wallet.width}
                  alt="wallet_img"
                />
                <h5>{wallet.title} </h5>
                <p>{wallet.desc} </p>
                <button onClick={handleConnectWallet}>Connect Wallet</button>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Dialog>
  );
}
