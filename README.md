# Nouns Name Service

Welcome to the repository of the [Nouns Name Service](https://nns.xyz).

Here you find all contracts and services used to run NNS.

## Packages

### Contracts

The [contracts](./packages/contracts/) package contains all the solidity code implementing the NNS protocol. You can find more info in the [docs](https://docs.nns.xyz/for-devs/nns-protocol).

### Subgraph

The [subgraph](./packages/subgraph/) package implements a subgraph deployed in goldsky.com to make it easy to access NNS data via a GraphQL [endpoint](https://api.goldsky.com/api/public/project_clxhxljv7a17t01x72s9reuqf/subgraphs/nns/live/gn).

### API

The [api](./packages/api/) package implements two sets of APIs:
1. The standard api `api.nns.xyz` used to check availability and register NNS names for complex use-cases when a simple on-chain implementation wouldn't be possible (more info [here](https://docs.nns.xyz/for-devs/nns-protocol#registration-of-new-names)).
2. The metadata api `metadata.nns.xyz` which returns metadata for all NFTs issued by the protocol.

Both apis are deployed on AWS.

### Images

The [images](./packages/images/) package implements the generation of images for all NFTs issued by the protocol. Images are generated on the fly the first time they are requested and stored in an S3 bucket and then, for all subsequent requests, they will be returned by the CDN (CloudFront).
