import { Domain } from "./generate-image";
import fs from "fs/promises";

const d = new Domain({
  cld: Domain.RESOLVING_TOKEN_CLD, //"⌐◨-◨",
  name: "gnars",
});

fs.writeFile("./img.html", d.getPage());
