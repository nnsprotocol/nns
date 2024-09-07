import { task } from "hardhat/config";
import fs from "fs/promises";

task("export-abi-ts").setAction(async (args, hre, runSuper) => {
  await hre.run("export-abi");

  const folder = hre.config.abiExporter[0].path || "./abi";
  const files = await fs.readdir(folder);
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const filePath = `${folder}/${file}`;
    const tsFilePath = filePath.replace(".json", ".ts");
    await fs.rm(tsFilePath).catch(() => {});

    const content = await fs.readFile(filePath, "utf-8");
    const tsContent = `export default ${content.trim()} as const;`;
    const tsFile = file.replace(".json", ".ts");
    await fs.writeFile(`${folder}/${tsFile}`, tsContent);
  }
});
