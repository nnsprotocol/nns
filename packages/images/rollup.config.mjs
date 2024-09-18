import typescript from "@rollup/plugin-typescript";
import dotenv from "rollup-plugin-dotenv";

export default {
  input: "src/origin-response.ts",
  output: {
    file: "dist/origin-response.js",
    format: "cjs",
  },
  external: ["@aws-sdk/client-s3"],
  plugins: [
    dotenv(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
