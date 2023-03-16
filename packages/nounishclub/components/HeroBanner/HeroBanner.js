import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./HeroBanner.module.scss";

import { useEthers } from "@usedapp/core";
import { useClaimName, useNumberOfClaims } from "../../hooks/hooks";
import DiscordDialog from "../DiscordDialog/DiscordDialog";
import { useEffect, useState } from "react";
import ChooseWallet from "../ChooseWallet/ChooseWallet";
import ClaimAmount from "../ClaimAmount/ClaimAmount";
import MintingProgress from "../MintingProgress/MintingProgress";
import Wrong from "../Wrong/Wrong";
import CompleteScreen from "../CompleteScreen/CompleteScreen";

const HeroBanner = () => {
  const [open, setOpen] = useState(false);
  const [wrongOpen, setWrongOpen] = useState(false);
  const [chooseWalletOpen, setChooseWalletOpen] = useState(false);
  const [mintingOpen, setMintingOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  // FIXME: uncomment
  // const { account, isLoading, deactivate } = useEthers();
  // let {
  //   send,
  //   isLoading: claimLoading,
  //   error,
  //   registeredName,
  //   errorCode,
  // } = useClaimName();
  // const claims = useNumberOfClaims(account);

  const handleChooseWalletOpen = () => {
    setChooseWalletOpen(true);
  };

  const handleCloseChooseWalletOpen = () => {
    setChooseWalletOpen(false);
  };

  const handleWrongWindowClose = () => {
    setWrongOpen(false);
  };

  // FIXME: uncomment
  // useEffect(() => {
  //   if (claimLoading) setMintingOpen(true);
  // }, [claimLoading]);

  // useEffect(() => {
  //   if (error) {
  //     if (errorCode === 4001) {
  //       setWrongOpen(true);
  //     } else if (errorCode === -32603) {
  //       setOpen(true);
  //     } else {
  //       setWrongOpen(true);
  //     }
  //   }
  //   return () => {};
  // }, [error, deactivate, errorCode]);

  return (
    <Container id="hero">
      <div className={classes.hero_container}>
        <h1>
          Share the value.
          <br />
          Join the <span>Nounish Club.</span>
        </h1>
        <p>
          An exclusive club reserved to 10k holders. Everyone does their share,
          and everyone shares the value.
        </p>
        {/* FIXME: UNCOMMENT */}
        {/* <button
          className={classes.claim}
          onClick={() => {
            if (!account) {
              handleChooseWalletOpen();
            }
            if (account && !isLoading) {
              send();
            }
          }}
        >
          Claim
        </button>
        {account && <ClaimAmount />}
        <button
          className={classes.scroll_down}
          onClick={() => {
            if (!account) {
              handleChooseWalletOpen();
            }
            if (account && !isLoading) {
              send();
            }
          }}
        >
          <Image
            src="/Subtract.svg"
            alt="keyboard_arrow_down"
            width={40}
            height={26}
          />
        </button>
        <DiscordDialog open={open} />
        <ChooseWallet
          open={chooseWalletOpen}
          handleClose={handleCloseChooseWalletOpen}
        />

        <MintingProgress
          open={mintingOpen}
          claimLoading={claimLoading}
          handleClose={() => {
            setMintingOpen(false);
            setCompleteOpen(true);
          }}
        />
        <Wrong open={wrongOpen} handleClose={handleWrongWindowClose} />
        {registeredName && (
          <CompleteScreen
            open={completeOpen}
            handleClose={() => setCompleteOpen(false)}
            registeredName={registeredName}
          />
        )} */}
      </div>
    </Container>
  );
};

export default HeroBanner;
