/* eslint-disable react/no-unescaped-entities */
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import classes from "./DiscordDialog.module.scss";
import Link from "next/link";

export default function DiscordDialog({ open }) {
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: "#1F1F23",
            boxShadow: "none",
            maxWidth: {
              xs: "100vw",
              md: "60vw",
              sx: "60vw",
            },
          },
        }}
      >
        <DialogContent
          className={classes.dialog_title}
          sx={{
            padding: {
              sx: "5rem",
              md: "5rem",
              xs: "2rem",
            },
          }}
        >
          <h2>
            It seems you don't have any claim available. Get one on Discord!
          </h2>
          <Link
            href="https://discord.com/invite/pnDEEK2caX"
            className={classes.discord}
          >
            Join Discord
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
