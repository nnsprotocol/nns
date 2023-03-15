import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./Footer.module.scss";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";

const Footer = () => {
  return (
    <Container id="footer">
      <footer className={classes.footer}>
        <div className={classes.footer_top}>
          <ScrollLink
            to="hero"
            spy={true}
            smooth={true}
            offset={50}
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
          </ScrollLink>
        </div>
        <div className={classes.footer_bottom}>
          <div className={classes.social_media}>
            <Link href="https://twitter.com/nnsprotocol">
              <Image
                className={classes.logo_img}
                src="/twitter.svg"
                alt="logo"
                width={25}
                height={25}
              />
            </Link>
            <Link href="https://discord.com/invite/pnDEEK2caX">
              <Image
                className={classes.logo_img}
                src="/discord.svg"
                alt="logo"
                width={25}
                height={25}
              />
            </Link>
          </div>
          <div>
            <p>
              Made with <FavoriteIcon fontSize="14" sx={{ color: "red" }} /> in
              the nouniverse
            </p>
          </div>
        </div>
      </footer>
    </Container>
  );
};

export default Footer;
