import Image from "next/image";
import { useEffect, useState } from "react";
import classes from "./Header.module.scss";
import { Link } from "react-scroll";
import ChooseWallet from "../ChooseWallet/ChooseWallet";
import { useEthers } from "@usedapp/core";
import Wrong from "../Wrong/Wrong";

const Header = () => {
  const [stickyClass, setStickyClass] = useState(false);
  const [open, setOpen] = useState(false);
  const [wrongOpen, setWrongOpen] = useState(false);
  // FIXME: uncomment
  // const { error } = useEthers();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const ConnectButton = () => {
    const { account, deactivate } = useEthers();

    if (account) {
      return (
        <button className={classes.connect_button} onClick={() => deactivate()}>
          Disconnect
        </button>
      );
    } else {
      return (
        <button className={classes.connect_button} onClick={handleClickOpen}>
          Connect Wallet
        </button>
      );
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", stickNavbar);

    return () => {
      window.removeEventListener("scroll", stickNavbar);
    };
  }, []);

  const stickNavbar = () => {
    if (window !== undefined) {
      let windowHeight = window.scrollY;

      windowHeight > 50 ? setStickyClass(true) : setStickyClass(false);
    }
  };

  // FIXME: uncomment
  // useEffect(() => {
  //   if (error) setWrongOpen(true);
  // }, [error]);

  return (
    // <Container>
    <>
      <div
        className={stickyClass ? classes.sticky_header : classes.navbar_header}
      >
        <div className={classes.header_toolbar}>
          <Link
            to="hero"
            spy={true}
            smooth={true}
            duration={1000}
            style={{ cursor: "pointer" }}
          >
            <Image
              className={classes.logo_img}
              src="/logo.svg"
              alt="logo"
              width={278}
              height={32}
            />
          </Link>

          {/* FIXME: uncomment */}
          {/* <ConnectButton /> */}
        </div>
      </div>
      {/* FIXME: uncomment */}
      {/* <ChooseWallet open={open} handleClose={handleClose} /> */}
      {/* <Wrong open={wrongOpen} handleClose={() => setWrongOpen(false)} /> */}
    </>
    // </Container>
  );
};

export default Header;
