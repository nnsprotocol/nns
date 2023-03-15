import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./WhatToDo.module.scss";

const cardList = [
  {
    image: "/discord.png",
    title: "Join the rest of the Squad on Discord",
    width: 103,
    height: 152,
  },
  {
    image: "/wood-twitter.png",
    title: "Follow us on Twitter",
    width: 99,
    height: 152,
  },
  {
    image: "/green.png",
    title: "Be ready for distribution initiatives",
    width: 124,
    height: 152,
  },
  {
    image: "/red-earn.png",
    title: "Earn your spot in the Club",
    width: 210,
    height: 234,
  },
];

const WhatToDo = () => {
  return (
    <Container>
      <div className={classes.what_to_do_container}>
        <h2>What to do</h2>
        <div className={classes.card_deck}>
          {cardList.map((card, indx) => (
            <div className={classes.card} key={card.title}>
              <div className={classes.card_image}>
                <Image
                  src={card.image}
                  width={card.width}
                  height={card.height}
                  alt="card_img"
                />
              </div>
              <h5>{card.title} </h5>
              <div className={classes.gradient_card_number}>
                <h2>{indx + 1}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default WhatToDo;
