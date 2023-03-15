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
    details: "details",
  },
  {
    title: "What is a ◨-◨  domain?",
    details: "details",
  },
  {
    title: "What’s the idea behind the Nounish Club?",
    details: "details",
  },
  {
    title: "What are the benefits of owning a Nounish Club name?",
    details: "details",
  },
  {
    title: "What are the benefits of owning a Nounish Club name?",
    details: "details",
  },
];

const faqRight = [
  {
    title: "Can I choose my Nounish Club number?",
    details: "details",
  },
  {
    title: "How does the Proof of Proliferation work?",
    details: "details",
  },
  {
    title: "Why is the Nounish Club important for the NNS?",
    details: "details",
  },
  {
    title: "How can I get a Nounish Club name?",
    details: "details",
  },
  {
    title: "How can I get a Nounish Club name?",
    details: "details",
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
