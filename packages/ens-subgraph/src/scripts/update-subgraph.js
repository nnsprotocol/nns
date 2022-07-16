#!/usr/bin/env node
yaml = require('js-yaml')
fs = require('fs')

const NETWORK = 'localhost';

const fileName = 'subgraph.yaml'
const doc = yaml.safeLoad(fs.readFileSync(fileName))
const deploymentFolder = `../ens-contracts/deployments/${NETWORK}`;

function getAddress(contract) {
  const file = fs.readFileSync(`${deploymentFolder}/${contract}.json`);
  const data = JSON.parse(file);
  return data.address;
}

let name, address
doc.dataSources.forEach(s => {
  switch (s.name) {
    case 'ENSRegistry':
      s.source.address = getAddress("ENSRegistry")
      break
    case 'BaseRegistrar':
      s.source.address = getAddress("BaseRegistrarImplementation")
      break
    case 'NNSRegistrarControllerWithReservation':
      s.source.address = getAddress("NNSRegistrarControllerWithReservation");
      break
    default:
      name = null
  }
  if (name) {
    address = addresses[name]
    console.log(`${s.name} == ${name}(${address})`)
    s.source.address = address
  }
})
fs.writeFileSync(fileName, yaml.safeDump(doc))
