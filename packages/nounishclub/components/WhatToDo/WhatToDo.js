import { Container } from "@mui/material";
import Image from "next/image";
import classes from "./WhatToDo.module.scss";

const cardList = [
  {
    image: "/discord.png",
    title: "Join the Squad on Discord",
    width: 103,
    height: 152,
  },
  {
    image: "/wood-twitter.png",
    // title: "Follow @nnsprotocol on Twitter",
    component: (
      <h5>
        Follow{" "}
        <a target="_blank" href="https://twitter.com/nnsprotocol">
          @nnsprotocol
        </a>{" "}
        on Twitter
      </h5>
    ),
    width: 99,
    height: 152,
  },
  {
    image: "/green.png",
    title: "Participate in distribution initiatives",
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
        <h2>To get your number</h2>
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
              {card.component || null}
              {card.title && <h5>{card.title}</h5>}
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
