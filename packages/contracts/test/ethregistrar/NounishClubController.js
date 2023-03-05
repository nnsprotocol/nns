const ENS = artifacts.require('./registry/ENSRegistry')
const BaseRegistrar = artifacts.require(
  './registrar/BaseRegistrarImplementation',
)
const PublicResolver = artifacts.require('./resolvers/PublicResolver')
const Controller = artifacts.require('./ethregistrar/NounishClubController')

const namehash = require('eth-ens-namehash')
const sha3 = require('web3-utils').sha3

const { exceptions } = require('../test-utils')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TLD = '⌐◨-◨'

contract('NounishClubController', function (accounts) {
  const [owner, w1, w2, w3] = accounts

  const FROM = 1003
  const TO = 1094

  let ens
  let registrar
  let controller
  let resolver
  const ALL_NAMES = Array.from({ length: TO - FROM + 1 }).map((_, n) =>
    String(FROM + n),
  )

  beforeEach(async () => {
    ens = await ENS.new()
    registrar = await BaseRegistrar.new(ens.address, namehash.hash(TLD), {
      from: owner,
    })
    await ens.setSubnodeOwner('0x0', sha3(TLD), registrar.address)

    controller = await Controller.new(registrar.address, FROM, TO)
    await registrar.addController(controller.address, { from: owner })
    await registrar.addController(owner, { from: owner })

    resolver = await PublicResolver.new(ens.address, ZERO_ADDRESS, ZERO_ADDRESS)
  })

  describe('claims mgmt', () => {
    it('returns zero as initial claims count', async () => {
      const count = await controller.claimsCount(w1, Date.now())
      assert.equal(count, 0)
    })

    it('should not allow setting claims by non-owner', async () => {
      const op = controller.createClaims([], Date.now(), { from: w1 })
      await exceptions.expectFailure(op)
    })

    it('should create claims', async () => {
      const now = Math.round(Date.now() / 1000)
      await controller.createClaims([w1, w2], now + 1e2, {
        from: owner,
      })
      await controller.createClaims([w2], now + 1e4, {
        from: owner,
      })

      const beforeFirstExpiry = now
      assert.equal(await controller.claimsCount(w1, beforeFirstExpiry), 1)
      assert.equal(await controller.claimsCount(w2, beforeFirstExpiry), 2)
      assert.equal(await controller.claimsCount(w3, beforeFirstExpiry), 0)
      assert.equal(await controller.claimsCount(owner, beforeFirstExpiry), 0)

      const inBetweenExpiry = now + 1e3
      assert.equal(await controller.claimsCount(w1, inBetweenExpiry), 0)
      assert.equal(await controller.claimsCount(w2, inBetweenExpiry), 1)

      const afterBothExpiry = now + 1e5
      assert.equal(await controller.claimsCount(w1, afterBothExpiry), 0)
      assert.equal(await controller.claimsCount(w2, afterBothExpiry), 0)
    })
  })

  describe('registration', () => {
    it('should not register if there are no claims', async () => {
      const op = controller.register(ZERO_ADDRESS, w3)
      await exceptions.expectFailure(op)
    })

    it('should register and consume a claim', async () => {
      let { timestamp } = await web3.eth.getBlock('latest')
      await controller.createClaims([w1], timestamp + 1e4, {
        from: owner,
      })
      const claimsBefore = await controller.claimsCount(w1, timestamp)
      assert.isAbove(Number(claimsBefore), 0)

      const tx = await controller.register(resolver.address, w1, {
        from: w1,
      })
      const event = tx.receipt.logs[0]
      assert.equal(event.event, 'NameRegistered')
      assert.isNotNaN(parseInt(event.args.name))
      assert.equal(event.args.owner, w1)
      assert.equal(event.args.label, sha3(event.args.name))

      const name = event.args.name
      const tokenId = sha3(name)
      const node = namehash.hash(`${name}.${TLD}`)

      const claimsAfter = await controller.claimsCount(w1, timestamp)
      assert.equal(claimsAfter, claimsBefore - 1)

      // Check ownership on registrar and registry
      assert.equal(await registrar.ownerOf(tokenId), w1)
      assert.equal(await ens.owner(node), w1)
      // Check resolver is set
      assert.equal(await ens.resolver(node), resolver.address)
      // Check value of the address is set on the resolver
      assert.equal(await resolver.addr(node), w1)
    })

    it('should reject when all names are registered', async () => {
      for (const n of ALL_NAMES) {
        await registrar.register(sha3(n), w3, { from: owner })
      }

      let { timestamp } = await web3.eth.getBlock('latest')
      await controller.createClaims([w1], timestamp + 1e4, {
        from: owner,
      })
      const op = controller.register(resolver.address, w1, {
        from: w1,
      })
      await exceptions.expectFailure(op)
    })

    it('should reject when all names are in the deny list', async () => {
      const labels = ALL_NAMES.map((n) => sha3(n))
      await controller.addToDenyList(labels, {
        from: owner,
      })

      let { timestamp } = await web3.eth.getBlock('latest')
      await controller.createClaims([w1], timestamp + 1e4, {
        from: owner,
      })
      const op = controller.register(resolver.address, w1, {
        from: w1,
      })
      await exceptions.expectFailure(op)
    })

    it('should sample and register a name between FROM and TO', async () => {
      let { timestamp } = await web3.eth.getBlock('latest')
      await controller.createClaims([w1], timestamp + 1e4, {
        from: owner,
      })
      const tx = await controller.register(resolver.address, w1, {
        from: w1,
      })

      const event = tx.receipt.logs[0]
      const num = parseInt(event.args.name)
      assert.isAtLeast(num, FROM)
      assert.isAtMost(num, TO)
    })

    it('should register all names from FROM to TO', async () => {
      const { timestamp } = await web3.eth.getBlock('latest')
      for (let i = FROM; i <= TO; i++) {
        await controller.createClaims([w1], timestamp + 1e4, {
          from: owner,
        })
      }
      const registeredNumbers = new Set()
      for (let i = FROM; i <= TO; i++) {
        const tx = await controller.register(resolver.address, w1, {
          from: w1,
        })
        const event = tx.receipt.logs[0]
        const num = parseInt(event.args.name)
        assert.isFalse(registeredNumbers.has(num))
        assert.isAtLeast(num, FROM)
        assert.isAtMost(num, TO)
        registeredNumbers.add(num)
      }
      assert.lengthOf(registeredNumbers, TO - FROM + 1)
      assert.equal(0, await controller.claimsCount(w1, timestamp + 1e4))
      // Next should fail
      await controller.createClaims([w1], timestamp + 1e4, {
        from: owner,
      })
      const op = controller.register(resolver.address, w1, {
        from: w1,
      })
      await exceptions.expectFailure(op)
    })
  })

  describe('deny list', () => {
    it('should not allow non-owner to add to the deny list', async () => {
      const op = controller.addToDenyList([sha3('test')], {
        from: w1,
      })
      await exceptions.expectFailure(op)
    })

    it('should not allow non-owner to remove from the deny list', async () => {
      const op = controller.removeFromDenyList([sha3('test')], {
        from: w1,
      })
      await exceptions.expectFailure(op)
    })

    it('should add and remove from the list', async () => {
      const n1 = sha3('block-1')
      const n2 = sha3('block-2')

      // Add and check
      await controller.addToDenyList([n1, n2], {
        from: owner,
      })
      assert.isTrue(await controller.denyList(n1))
      assert.isTrue(await controller.denyList(n2))

      // Remove one and check
      await controller.removeFromDenyList([n1], {
        from: owner,
      })
      assert.isFalse(await controller.denyList(n1))
      assert.isTrue(await controller.denyList(n2))

      // Remove the other one and check
      await controller.removeFromDenyList([n2], {
        from: owner,
      })
      assert.isFalse(await controller.denyList(n1))
      assert.isFalse(await controller.denyList(n2))
    })
  })
})
