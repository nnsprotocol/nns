import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  Approval,
  ApprovalForAll,
  DelegateChanged,
  DelegateVotesChanged,
  DescriptorLocked,
  DescriptorUpdated,
  MinterLocked,
  MinterUpdated,
  NounBurned,
  NounCreated,
  NoundersDAOUpdated,
  OwnershipTransferred,
  SeederLocked,
  SeederUpdated,
  Transfer
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.approved = event.params.approved

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DELEGATION_TYPEHASH(...)
  // - contract.DOMAIN_TYPEHASH(...)
  // - contract.balanceOf(...)
  // - contract.checkpoints(...)
  // - contract.contractURI(...)
  // - contract.dataURI(...)
  // - contract.decimals(...)
  // - contract.delegates(...)
  // - contract.descriptor(...)
  // - contract.getApproved(...)
  // - contract.getCurrentVotes(...)
  // - contract.getPriorVotes(...)
  // - contract.isApprovedForAll(...)
  // - contract.isDescriptorLocked(...)
  // - contract.isMinterLocked(...)
  // - contract.isSeederLocked(...)
  // - contract.mint(...)
  // - contract.minter(...)
  // - contract.name(...)
  // - contract.nonces(...)
  // - contract.noundersDAO(...)
  // - contract.numCheckpoints(...)
  // - contract.owner(...)
  // - contract.ownerOf(...)
  // - contract.proxyRegistry(...)
  // - contract.seeder(...)
  // - contract.seeds(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenByIndex(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenURI(...)
  // - contract.totalSupply(...)
  // - contract.votesToDelegate(...)
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleDelegateChanged(event: DelegateChanged): void {}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {}

export function handleDescriptorLocked(event: DescriptorLocked): void {}

export function handleDescriptorUpdated(event: DescriptorUpdated): void {}

export function handleMinterLocked(event: MinterLocked): void {}

export function handleMinterUpdated(event: MinterUpdated): void {}

export function handleNounBurned(event: NounBurned): void {}

export function handleNounCreated(event: NounCreated): void {}

export function handleNoundersDAOUpdated(event: NoundersDAOUpdated): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSeederLocked(event: SeederLocked): void {}

export function handleSeederUpdated(event: SeederUpdated): void {}

export function handleTransfer(event: Transfer): void {}
