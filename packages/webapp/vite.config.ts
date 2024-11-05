import react from "@vitejs/plugin-react";
import Unfonts from "unplugin-fonts/vite";
import { defineConfig } from "vite";
import { ViteFaviconsPlugin } from "vite-plugin-favicon";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ViteFaviconsPlugin("./public/favicon.png"),
    react(),
    Unfonts({
      custom: {
        families: [
          {
            name: "Geist",
            src: "./src/assets/fonts/geist/*.woff2",
          },
        ],
      },
    }),
    // sentryVitePlugin({
    //   org: "nns-l5",
    //   project: "javascript-react",
    // }),
  ],

  build: {
    sourcemap: true,
  },
});
