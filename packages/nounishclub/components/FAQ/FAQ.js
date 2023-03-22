import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./FAQ.module.scss";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqLeft = [
  {
    title: "What is the NNS?",
    details: (
      <>
        The NNS stands for Nouns Name Service. It's an ambitious project made to
        spread the nounish culture at a whole new level. You can find out more{" "}
        <a href="https://nns.xyz/" target="_blank">
          here
        </a>
        .
      </>
    ),
  },
  {
    title: "What is a .⌐◨-◨ domain?",
    details: (
      <>
        The .⌐◨-◨ is your entry point to the NNS ecosystem.
        <br />
        It allows you to attach the legendary noggles to your on-chain identity
        and be resolved as yourname.⌐◨-◨ in the Nouniverse and across a growing
        list of platforms.
      </>
    ),
  },
  {
    title: "What’s the idea behind the Nounish Club?",
    details: (
      <>
        It’s shared ownership at its best, where everyone gets access to an ever
        growing set of perks, which is freely and collectively provided by its
        most active members.
        <br />
        <br />
        And no, you don’t have to be among them to enjoy the perks. However,
        should you choose to be, the glory is not the only reward you’ll get.
        <br />
        <br />
        Of course, adding a perk will give your projects immediate visibility to
        a huge amount of people, but again, that’s not all.
      </>
    ),
  },
  {
    title: "How can I join the Nounish Club?",
    details: (
      <>
        You just need to follow{" "}
        <a target="_blank" href="https://twitter.com/nnsprotocol">
          @nnsprotocol
        </a>{" "}
        on Twitter and join the Squad on Discord.
        <br />
        <br />
        We will constantly launch new distribution initiatives and with a bit of
        luck, you will be able to get a random number from 1000 to 9999.
        <br />
        <br />
        Of course, adding a perk will give your projects immediate visibility to
        a huge amount of people, but again, that’s not all.
      </>
    ),
  },
  {
    title: "How do I choose my favourite number?",
    details: (
      <>
        The only way to choose your favourite number is by doing something that
        can make the Nounish Club more valuable. Basically, you need to be among
        those active members who provide amazing perks to the Club.
        <br />
        <br />
        And this is where the extra reward we mentioned comes into play…
        <br />
        <br />
        What if we tell you that you get to choose your own nounish number?
      </>
    ),
  },
];

const faqRight = [
  {
    title: "What about the numbers from 0 to 999?",
    details: (
      <>
        Those numbers are reserved to nouners.
        <br />
        Every nouner can have the correspondent number of their own Noun.
        <br />
        <br />
        If you are a nouner, follow{" "}
        <a target="_blank" href="https://twitter.com/nnsprotocol">
          @nnsprotocol
        </a>{" "}
        on Twitter and join our Discord.
        <br />
        <br />
        That’s all you have to do to get your number.
      </>
    ),
  },
  {
    title: "Why so much importance to Twitter and Discord?",
    details: (
      <>
        In the coming weeks, NNS will greatly evolve, giving true power to
        projects and holders.
        <br />
        <br />
        But to really bring our vision to life, we need a base to coordinate all
        the next missions and to help our members connect with other nounish
        minds.
        <br />
        <br />
        A nounish hub that has the .⌐◨-◨ as its flag.
        <br />
        <br />
        Moving as an army instead of single individuals will make all our
        initiatives more effective and will bring more value to every member.
      </>
    ),
  },
  {
    title: "What are the benefits of owning a Nounish Club name?",
    details: (
      <>
        Being part of the Nounish Club will give you all the benefits of having
        a .⌐◨-◨, with the addition of exclusive perks and utilities only
        available to the Nounish Club.
        <br />
        <br />
        Also, the Nounish Club will be one of the most valuable NNS tiers. And
        this comes with a shiny rainbow badge you don’t want to miss.
        <br />
        <br />
        So, once you get one, keep it. You won’t regret it.
      </>
    ),
  },
  {
    title: "What are the nounish creatures who invaded the website?",
    details:
      "Honestly we don’t have a clue. They just appeared from nothing and they took control of the website.",
  },
  {
    title: "Have you tried to talk with them?",
    details: (
      <>
        Yeah but they speak a weird language.
        <br />
        They took all our noggles and they seem to love them. We’re trying to
        find out more and we’ll update you soon….
      </>
    ),
  },
];

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  backgroundColor: "#0A0A0A",
  border: `none`,
  marginBottom: "1rem",
  "&:not(:last-child)": {},
  "&:before": {
    display: "none",
  },
  ".MuiAccordion-root": {
    backgroundColor: "transparent;",
  },
}));

const AccordionSummary = styled((props) => <MuiAccordionSummary {...props} />)(
  ({ theme }) => ({
    color: "#ffffff",
    backgroundColor: "#0A0A0A",

    border: "none",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(180deg)",
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1),
      "& .MuiTypography-root": {
        [theme.breakpoints.down("sm")]: {
          fontSize: "15px",
        },
        fontSize: "20px",
        lineHeight: "28px",
        fontFamily: "Londrina Solid",
      },
    },
  })
);

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: 0,
  "& .MuiCollapse-root": {
    backgroundColor: "#0A0A0A !important",
  },
}));

const FAQ = () => {
  const [expanded, setExpanded] = React.useState("");
  const [activeButton, setActiveButton] = React.useState("button1");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  return (
    <section className={classes.section_faq}>
      <Container>
        <div className={classes.faq_container}>
          <div className={classes.faq_top}>
            <div>
              <h2>Nounish Questions</h2>
              <p>(aka Everything you want to know)</p>
            </div>
            <div className={classes.faq_img}>
              <Image
                src="/mug-painter.png"
                width={228}
                height={152}
                alt="faq_img"
              />
            </div>
          </div>
          <div className={classes.faq_deck}>
            <div>
              {faqLeft.map((item, indx) => (
                <Accordion
                  expanded={expanded === `panel1${indx}`}
                  onChange={handleChange(`panel1${indx}`)}
                  key={indx}
                >
                  <AccordionSummary
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                    expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  >
                    <Typography>{item.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: { xs: "15px", sm: "1rem" },
                        fontFamily: "Poppins",
                        marginLeft: "1rem",
                      }}
                    >
                      {item.details}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
            <div>
              {faqRight.map((item, indx) => (
                <Accordion
                  expanded={expanded === `panel2${indx}`}
                  onChange={handleChange(`panel2${indx}`)}
                  key={indx}
                >
                  <AccordionSummary
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                    expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  >
                    <Typography>{item.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: { xs: "15px", sm: "1rem" },
                        fontFamily: "Poppins",
                        marginLeft: "1rem",
                      }}
                    >
                      {item.details}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
