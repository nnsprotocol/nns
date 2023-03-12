const ENS = artifacts.require('./registry/ENSRegistry')
const BaseRegistrar = artifacts.require(
  './registrar/BaseRegistrarImplementation',
)
const PublicResolver = artifacts.require('./resolvers/PublicResolver')
const Controller = artifacts.require('./ethregistrar/NounishClubController')
const { ethers } = require('hardhat')

const namehash = require('eth-ens-namehash')
const sha3 = require('web3-utils').sha3

const { exceptions } = require('../test-utils')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TLD = '⌐◨-◨'

contract('NounishClubController', function () {
  let ens
  let registrar
  let controller
  let resolver
  let owner
  let signer
  let w1, w2
  let wallets

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    signer = accounts[1]
    w1 = accounts[2]
    w2 = accounts[3]
    wallets = {
      w1,
      w1,
      owner,
      signer,
    }
    ens = await ENS.new()
    registrar = await BaseRegistrar.new(ens.address, namehash.hash(TLD), {
      from: owner.address,
    })
    await ens.setSubnodeOwner('0x0', sha3(TLD), registrar.address)

    controller = await Controller.new(registrar.address, signer.address)
    await registrar.addController(controller.address, { from: owner.address })
    await registrar.addController(owner.address, { from: owner.address })

    resolver = await PublicResolver.new(ens.address, ZERO_ADDRESS, ZERO_ADDRESS)
  })

  async function createSignature(signer, data) {
    const hash = ethers.utils.solidityKeccak256(
      // sender, number, nonce, expiry, resolver, addr
      ['address', 'uint16', 'uint256', 'uint256', 'address', 'address'],
      [
        data.sender,
        data.number,
        data.nonce,
        data.expiry,
        data.resolver,
        data.addr,
      ],
    )
    const signature = await signer.signMessage(ethers.utils.arrayify(hash))
    return {
      ...data,
      signature,
    }
  }

  const validData = () => ({
    sender: w1.address,
    number: 1234,
    nonce: 9999999,
    expiry: Date.now() + 1000,
    resolver: resolver.address,
    addr: w1.address,
  })

  const tests = [
    {
      name: 'signed by other wallet',
      context: () => ({
        signer: w2,
        sender: w1,
        data: validData(),
      }),
    },
    {
      name: 'number has changed',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.number = 666
        },
      }),
    },
    {
      name: 'expiry has changed',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.expiry = Date.now() + 123 + 1000
        },
      }),
    },
    {
      name: 'nonce has changed',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.nonce = 998822334455
        },
      }),
    },
    {
      name: 'resolver has changed',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.resolver = owner.address
        },
      }),
    },
    {
      name: 'addr has changed',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.addr = owner.address
        },
      }),
    },
    {
      name: 'bad signature',
      context: () => ({
        signer: signer,
        sender: w1,
        data: validData(),
        update: (d) => {
          d.signature = '0xAABB' + d.signature.slice(6)
        },
      }),
    },
    {
      name: 'wrong sender',
      context: () => ({
        signer: signer,
        sender: w1,
        data: {
          ...validData(),
          sender: w2.address,
        },
      }),
    },
    {
      name: 'expired',
      context: () => ({
        signer: signer,
        sender: w1,
        data: {
          ...validData(),
          expiry: 100,
        },
      }),
    },
  ].forEach((t) => {
    it(t.name, async () => {
      const ctx = t.context()
      const data = await createSignature(ctx.signer, ctx.data)
      if (ctx.update) {
        ctx.update(data)
      }
      const op = controller.register(
        data.number,
        data.nonce,
        data.expiry,
        data.resolver,
        data.addr,
        data.signature,
        { from: ctx.sender.address },
      )
      await exceptions.expectFailure(op)
    })
  })

  it('name not available', async () => {
    const number = 9988
    await registrar.register(sha3(`${number}`), owner.address, {
      from: owner.address,
    })

    const data = await createSignature(signer, {
      ...validData(),
      number,
    })
    const op = controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )
    await exceptions.expectFailure(op)
  })

  it('nonce already used', async () => {
    // register first name successfully
    const nonce = 2
    let data = await createSignature(signer, {
      ...validData(),
      nonce,
      number: 7,
    })
    await controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )

    // Register a second number with the same nonce
    data = await createSignature(signer, {
      ...validData(),
      nonce,
      number: 8,
    })
    const op = controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )
    await exceptions.expectFailure(op)
  })

  it('fails when registering twice', async () => {
    // register first name successfully

    let data = await createSignature(signer, validData())
    await controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )
    const op = controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )
    await exceptions.expectFailure(op)
  })

  it('successfully registers number', async () => {
    const data = await createSignature(signer, validData())
    const tx = await controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.addr,
      data.signature,
      { from: data.sender },
    )

    const event = tx.receipt.logs[0]
    assert.equal(event.event, 'NameRegistered')
    assert.equal(parseInt(event.args.name), data.number.toString())
    assert.equal(event.args.owner, data.sender)
    assert.equal(event.args.label, sha3(event.args.name))
  })
})
