const ENS = artifacts.require('./registry/ENSRegistry')
const BaseRegistrar = artifacts.require(
  './registrar/BaseRegistrarImplementation',
)
const PublicResolver = artifacts.require('./resolvers/PublicResolver')
const Controller = artifacts.require('./ethregistrar/NounishClubController2')
const { ethers } = require('hardhat')

const namehash = require('eth-ens-namehash')
const sha3 = require('web3-utils').sha3

const { exceptions } = require('../test-utils')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TLD = '⌐◨-◨'

contract('NounishClubController2', function (accounts) {
  let ens
  let registrar
  let controller
  let resolver
  let owner
  let signer
  let w1

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    const wallet = new ethers.Wallet(
      'a1a84292ce4c927dda20f57c99b23e46d332dae2c03beb4811d2de3c3bc659dc',
    )
    owner = accounts[0]
    signer = wallet // accounts[1]
    w1 = accounts[2]
    ens = await ENS.new()
    registrar = await BaseRegistrar.new(ens.address, namehash.hash(TLD), {
      from: owner.address,
    })
    await ens.setSubnodeOwner('0x0', sha3(TLD), registrar.address)

    controller = await Controller.new(
      registrar.address,
      '0x9283DE2Ef7939c297Ec6aFA608e5a6b4eE4025cc',
    )
    await registrar.addController(controller.address, { from: owner.address })
    await registrar.addController(owner.address, { from: owner.address })

    resolver = await PublicResolver.new(ens.address, ZERO_ADDRESS, ZERO_ADDRESS)
  })

  it("let's see", async () => {
    const sender = w1
    // const nonce = 891289234234
    // const number = 2233
    // const expiry = Math.floor(Date.now() / 1000) + 10000

    const res = await fetch('http://localhost:8080', {
      method: 'POST',
      body: JSON.stringify({ address: sender.address }),
    })
    const data = await res.json()
    console.log(data)
    /*

    */

    const x = ethers.utils.solidityKeccak256(
      // sender, number, nonce, expiry, resolver, addr
      ['address', 'uint16', 'uint256', 'uint256', 'address', 'address'],
      [
        sender.address,
        data.number,
        data.nonce,
        data.expiry,
        data.resolver,
        sender.address,
      ],
    )
    console.log(x)
    console.log(data.hash)

    // const hash = ethers.utils.solidityKeccak256(
    //   // sender, number, nonce, expiry, resolver, addr
    //   ['address', 'uint16', 'uint256', 'uint256', 'address', 'address'],
    //   [sender.address, number, nonce, expiry, resolver.address, sender.address],
    // )

    const sign = await signer.signMessage(ethers.utils.arrayify(x))
    console.log('SUIGN', sign)

    const tx = await controller.register(
      data.number,
      data.nonce,
      data.expiry,
      data.resolver,
      data.address,
      data.signature,
      { from: sender.address },
    )

    // const tx = await controller.register(
    //   number,
    //   nonce,
    //   expiry,
    //   resolver.address,
    //   sender.address,
    //   sign,
    //   { from: sender.address },
    // )
    const event = tx.receipt.logs[0]
    assert.equal(event.event, 'NameRegistered')
    assert.equal(parseInt(event.args.name), number)
    assert.equal(event.args.owner, sender.address)
    assert.equal(event.args.label, sha3(event.args.name))
  })
})
