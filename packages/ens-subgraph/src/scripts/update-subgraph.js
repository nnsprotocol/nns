#!/usr/bin/env node
yaml = require("js-yaml");
fs = require("fs");

const NETWORK = "localhost";

function getNetwork() {
  let network;
  process.argv.forEach((v, idx, argv) => {
    if (v === "--network") network = argv[idx + 1];
  });
  if (!network) {
    console.log(`error: you must set --network XXXXX`);
    process.exit(-1);
  }
  return network;
}

const fileName = "subgraph.yaml";
const doc = yaml.safeLoad(fs.readFileSync(fileName));
const network = getNetwork();
const deploymentFolder = `../ens-contracts/deployments/${network}`;

function getAddress(contract) {
  const file = fs.readFileSync(`${deploymentFolder}/${contract}.json`);
  const data = JSON.parse(file);
  return data.address;
}

function getNetworkName(network) {
  if (network === "localhost") {
    return "mainnet";
  }
  return network;
}
const networkName = getNetworkName(network);
doc.dataSources.forEach((s) => {
  switch (s.name) {
    case "ENSRegistry":
      s.source.address = getAddress("ENSRegistry");
      break;
    case "BaseRegistrar":
      s.source.address = getAddress("BaseRegistrarImplementation");
      break;
    case "EthRegistrarController":
      s.source.address = getAddress("NNSRegistrarControllerWithReservation");
      break;
    default:
      if (s.source.address) {
        console.log(`error: datasource ${s.name} is unknown`);
        process.exit(-1);
      }
      break;
  }
  s.network = networkName;
  console.log(
    `${s.name} at ${s.source.address ?? "<not defined>"} on ${s.network}`
  );
});
fs.writeFileSync(fileName, yaml.safeDump(doc));
