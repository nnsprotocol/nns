import { injectGlobal } from 'emotion'
// import LondrinaSolidBlackTTF from './assets/nns/fonts/LondrinaSolid-Black.ttf'
// import LondrinaSolidRegularTTF from './assets/nns/fonts/LondrinaSolid-Regular.ttf'
import LondrinaSolidNNSTTF from './assets/nns/fonts/LondrinaSolid-NNS.ttf'
import PTRegWoff2 from './assets/nns/fonts/PT-Root-UI_Regular.woff2'
import PTRegWoff from './assets/nns/fonts/PT-Root-UI_Regular.woff'
import PTMediumWoff2 from './assets/nns/fonts/PT-Root-UI_Medium.woff2'
import PTMediumWoff from './assets/nns/fonts/PT-Root-UI_Medium.woff'
import PTBoldWoff2 from './assets/nns/fonts/PT-Root-UI_Bold.woff2'
import PTBoldWoff from './assets/nns/fonts/PT-Root-UI_Bold.woff'

injectGlobal`
  @font-face {
    font-family: "Londrina Solid";
    src: url(${LondrinaSolidNNSTTF});
  }
  @font-face {
    font-family: "PT Root UI";
    src: url(${PTRegWoff2}) format("woff2"),
      url(${PTRegWoff}) format("woff");
  }
  @font-face {
    font-family: "PT Root UI";
    font-weight: 500;
    src: url(${PTMediumWoff2}) format("woff2"),
      url(${PTMediumWoff}) format("woff");
  }
  @font-face {
    font-family: "PT Root UI";
    font-weight: 700;
    src: url(${PTBoldWoff2}) format("woff2"),
      url(${PTBoldWoff}) format("woff");
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: "PT Root UI";
    background: white;
    margin: 0;
  }

  a {
    color: black;
    text-decoration: none;
    transition: 0.2s;

    &:hover {
      color: black;
    }

    &:visited {
      color: black;
    } 
  }
`
