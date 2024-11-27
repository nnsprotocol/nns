deploy-local:
	cd packages/contracts
	yarn hardhat ignition deploy ./ignition/modules/NNS.ts --network localhost