// Import types and APIs from graph-ts
import {
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  ens,
  log
} from '@graphprotocol/graph-ts'

import {
  createEventID, ROOT_NODE, EMPTY_ADDRESS,
  uint256ToByteArray, byteArrayFromHex, concat
} from './utils'

// Import event types from the registry contract ABI
import {
  NameRegistered as NameRegisteredEvent,
  Transfer as TransferEvent,
} from './types/BaseRegistrar/BaseRegistrar'

import {
  NameRegistered as ControllerNameRegisteredEvent,
} from './types/EthRegistrarController/EthRegistrarController'

// Import entity types generated from the GraphQL schema
import { Account, Domain, Registration, NameRegistered, NameTransferred } from './types/schema'

var rootNode:ByteArray = byteArrayFromHex("739305fdceb24221237c3dea9f36a6fcc8dc81b45730358192886e1510532739")

export function handleNameRegistered(event: NameRegisteredEvent): void {
  let account = new Account(event.params.owner.toHex())
  account.save()

  let label = uint256ToByteArray(event.params.id)
  let registration = new Registration(label.toHex())
  registration.domain = crypto.keccak256(concat(rootNode, label)).toHex()
  registration.registrationDate = event.block.timestamp
  // registration.expiryDate = event.params.expires
  registration.registrant = account.id

  let labelName = ens.nameByHash(label.toHexString())
  if (labelName != null) {
    registration.labelName = labelName
  }
  registration.save()

  let registrationEvent = new NameRegistered(createEventID(event))
  registrationEvent.registration = registration.id
  registrationEvent.blockNumber = event.block.number.toI32()
  registrationEvent.transactionID = event.transaction.hash
  registrationEvent.registrant = account.id
  // registrationEvent.expiryDate = event.params.expires
  registrationEvent.save()
}

export function handleNameRegisteredByController(event: ControllerNameRegisteredEvent): void {
  setNamePreimage(event.params.name, event.params.label, event.params.cost);
}

function setNamePreimage(name: string, label: Bytes, cost: BigInt): void {
  const labelHash = crypto.keccak256(ByteArray.fromUTF8(name));
  if(!labelHash.equals(label)) {
    log.warning(
      "Expected '{}' to hash to {}, but got {} instead. Skipping.",
      [name, labelHash.toHex(), label.toHex()]
    );
    return;
  }

  if(name.indexOf(".") !== -1) {
    log.warning("Invalid label '{}'. Skipping.", [name]);
    return;
  }

  let domain = Domain.load(crypto.keccak256(concat(rootNode, label)).toHex())!
  if(domain.labelName !== name) {
    domain.labelName = name
    domain.name = name + '.⌐◨-◨'
    domain.save()
  }

  let registration = Registration.load(label.toHex());
  if(registration == null) return
  registration.labelName = name
  registration.cost = cost
  registration.save()
}

// export function handleNameRenewed(event: NameRenewedEvent): void {
//   let label = uint256ToByteArray(event.params.id)
//   let registration = Registration.load(label.toHex())!
//   // registration.expiryDate = event.params.expires
//   registration.save()

//   let registrationEvent = new NameRenewed(createEventID(event))
//   registrationEvent.registration = registration.id
//   registrationEvent.blockNumber = event.block.number.toI32()
//   registrationEvent.transactionID = event.transaction.hash
//   // registrationEvent.expiryDate = event.params.expires
//   registrationEvent.save()
// }

export function handleNameTransferred(event: TransferEvent): void {
  let account = new Account(event.params.to.toHex())
  account.save()

  let label = uint256ToByteArray(event.params.tokenId)
  let registration = Registration.load(label.toHex())
  if(registration == null) return;

  registration.registrant = account.id
  registration.save()

  let transferEvent = new NameTransferred(createEventID(event))
  transferEvent.registration = label.toHex()
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionID = event.transaction.hash
  transferEvent.newOwner = account.id
  transferEvent.save()
}
