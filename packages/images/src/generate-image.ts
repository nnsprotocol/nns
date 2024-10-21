const NOGGLES_SVG = `
<svg width="112" height="44" viewBox="0 0 112 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M62.3703 0.5H20.5186V43.5H62.3703V0.5ZM38.7274 7.97955H27.8095V36.023H38.7274V7.97955Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M111.5 0.5H69.6478V43.5H111.5V0.5ZM87.8519 7.97955H76.934V36.023H87.8519V7.97955Z" fill="white"/>
<rect x="0.5" y="13.5898" width="25.475" height="7.47826" fill="white"/>
<rect x="55.1011" y="13.5898" width="14.5571" height="7.47826" fill="white"/>
<rect x="7.79126" y="15.4551" width="20.5652" height="7.27857" transform="rotate(90 7.79126 15.4551)" fill="white"/>
</svg>
`;

export class Domain {
  static RESOLVING_TOKEN_CLD = "@@resolving";

  public readonly cld: string;
  public readonly name: string;

  constructor(cfg: string | { cld: string; name: string }) {
    if (typeof cfg === "string") {
      const components = cfg.split(".");
      this.cld = components.pop()!;
      this.name = components.join(".");
    } else {
      this.cld = cfg.cld;
      this.name = cfg.name;
    }
  }

  private getImageURL(): string {
    if (this.cld === "nouns") {
      return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nouns_dmksx2.png";
    } else if (this.cld === Domain.RESOLVING_TOKEN_CLD) {
      return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1729536138/nns/resolvingtoken_yjdcfc.png";
    }

    const length = Array.from(this.name).length;
    switch (length) {
      case 1:
      case 2:
        // Gold
        return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602782/nns/nns_gold_uy3pz1.png";
      // Silver
      case 3:
        return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nouns_dmksx2.png";
      default:
        // Red
        return "https://res.cloudinary.com/dadjrw0kc/image/upload/v1726602781/nns/nns_red_whxvdq.png";
    }
  }

  getPage() {
    return `
      <html>
        <head>
          <style>
            ${this.getCSS()}
          </style>
        </head>
        <body>
          ${this.getHTML()}
        </body>
      </html>
    `;
  }

  getHTML() {
    let formattedName = "";
    let heading = "";
    switch (this.cld) {
      case "⌐◨-◨":
        formattedName += `${this.name}.<span class="domain">${NOGGLES_SVG}</span>`; // use the svg image
        break;

      case Domain.RESOLVING_TOKEN_CLD:
        heading = `<p class="heading">Resolver</p>`;
        formattedName = this.name;
        break;

      default:
        formattedName = `${this.name}.${this.cld}`;
    }
    return `
      <div class="root">
        ${heading}
        <p class="name">${formattedName}</p>
      </div>
    `;
  }

  getCSS() {
    return `
      @font-face {
          font-family: 'Geist';
          src: url("https://res.cloudinary.com/dadjrw0kc/raw/upload/v1725441971/nns/Geist_Semibold.ttf") format('truetype');
          font-weight: normal;
          font-style: normal;
      }

      body { 
        background-color: transparent;
        margin: 0;
      }

      html,
      p {
        margin: 0;
        background-color: transparent;
      }

      .root {
        position: relative;
        width: 900px;
        height: 900px;
        background-color: transparent;
        background-image: url("${this.getImageURL()}");
        box-sizing: border-box;
      }

      .heading {
        font-family: "Geist";
        font-size: 48px;
        text-align: center;
        color: #535264;
        font-weight: 400;
        position: absolute;
        bottom: 225px;
        left: 95px;
      }

      .name {
        font-family: "Geist";
        font-size: 72px;
        text-align: center;
        color: ${this.cld === Domain.RESOLVING_TOKEN_CLD ? "#30303E" : "white"};
        font-weight: 500;
        position: absolute;
        bottom: 153px;
        left: 95px;
      }

      .domain {
        margin-left: -15px;
        vertical-align: baseline;
        position: relative;
        top: -3px;
      }
  `;
  }
}

type HTMLCSS2IImageKeys = {
  apiKey: string;
  apiId: string;
};

async function renderImage(d: Domain, creds: HTMLCSS2IImageKeys) {
  const auth = Buffer.from(`${creds.apiId}:${creds.apiKey}`).toString("base64");
  const genRes = await fetch("https://hcti.io/v1/image", {
    method: "POST",
    body: JSON.stringify({
      html: d.getHTML(),
      css: d.getCSS(),
      device_scale: 1,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  });

  if (!genRes.ok) {
    throw new Error(`Failed to render image: ${genRes.statusText}`);
  }
  const b = (await genRes.json()) as { url: string };

  const imgRes = await fetch(b.url);
  return {
    url: b.url,
    data: Buffer.from(await imgRes.arrayBuffer()),
  };
}

export async function generateImage(
  fullName: string,
  creds: HTMLCSS2IImageKeys
) {
  const d = new Domain(fullName);
  return renderImage(d, creds);
}
