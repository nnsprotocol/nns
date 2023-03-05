const ENS = artifacts.require('./registry/ENSRegistry.sol')
const PublicResolver = artifacts.require('PublicResolver.sol')
const ENSProxyResolver = artifacts.require('ENSProxyResolver.sol')

const { ethers } = require('hardhat')
const namehash = require('eth-ens-namehash')
const sha3 = require('web3-utils').sha3

const { exceptions } = require('../test-utils')

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

async function createRegistry(tld, owner) {
  const registry = await ENS.new({
    from: owner,
  })
  const resolver = await PublicResolver.new(registry.address, owner, owner, {
    from: owner,
  })
  await registry.setSubnodeOwner('0x0', sha3(tld), owner, {
    from: owner,
  })
  return {
    tld,
    rootNode: namehash.hash(tld),
    registry,
    resolver,
    owner,
  }
}

contract('ENSProxyResolver', function (accounts) {
  const [ensOwner, nnsOwner, proxyETHOwner, w1] = accounts

  let ens, nns, proxy

  beforeEach(async () => {
    ens = await createRegistry('eth', ensOwner)
    nns = await createRegistry('⌐◨-◨', nnsOwner)

    proxy = await ENSProxyResolver.new(
      nns.registry.address,
      namehash.hash('⌐◨-◨'),
      Buffer.from(dnsName('proxy.eth').slice(2), 'hex').length,
    )
    // Setup proxy.eth as a wildcard.
    await ens.registry.setSubnodeOwner(
      ens.rootNode,
      sha3('proxy'),
      proxyETHOwner,
      {
        from: ens.owner,
      },
    )
    await ens.registry.setResolver(namehash.hash('proxy.eth'), proxy.address, {
      from: proxyETHOwner,
    })
  })

  describe('supportsInterface function', async () => {
    it('supports ExtendedResolver interface', async () => {
      assert.equal(await proxy.supportsInterface('0x9061b923'), true) // ExtendedResolver
    })

    it('does not support a random interface', async () => {
      assert.equal(await proxy.supportsInterface('0x3b3b57df'), false)
    })
  })

  it('reverts on unsupported methods', async () => {
    const name = 'test.proxy.eth'
    const { data: calldata } = await nns.resolver.methods[
      'text(bytes32,string)'
    ].request(namehash.hash(name), 'value')
    const op = proxy.resolve(dnsName(name), calldata)
    await exceptions.expectFailure(op)
  })

  describe('addr', () => {
    void ['apbigcod', 'studio.apbidcod', 'mic.studio.apbidcod'].forEach(
      (name) => {
        it(`resolves "${name}" thorugh the proxy`, async () => {
          // Register ${name}.⌐◨-◨
          const node = namehash.hash(`${name}.⌐◨-◨`)
          let currentNode = nns.rootNode
          const parts = name.split('.')
          for (let i = parts.length - 1; i >= 0; i--) {
            await nns.registry.setSubnodeOwner(
              currentNode,
              sha3(parts[i]),
              w1,
              {
                from: currentNode == nns.rootNode ? nns.owner : w1,
              },
            )
            const currentName = parts.slice(i).join('.')
            currentNode = namehash.hash(`${currentName}.⌐◨-◨`)
          }
          await nns.registry.setResolver(node, nns.resolver.address, {
            from: w1,
          })
          await nns.resolver.methods['setAddr(bytes32,address)'](node, w1, {
            from: w1,
          })

          // Resolve using the proxy resolver.
          const { data: calldata } = await nns.resolver.methods[
            'addr(bytes32)'
          ].request(namehash.hash(`${name}.proxy.eth`))
          const resData = await proxy.resolve(
            dnsName(`${name}.proxy.eth`),
            calldata,
          )
          assert.isNotNull(resData)
          const [proxyAddrRes] = ethers.utils.defaultAbiCoder.decode(
            ['address'],
            resData,
          )
          assert.equal(w1, proxyAddrRes)

          // Resolve names using ethers.
          const net = await ethers.provider.getNetwork()
          // Directly on NNS
          net.ensAddress = nns.registry.address
          const nnsAddr = await ethers.provider.resolveName(`${name}.⌐◨-◨`)
          assert.equal(w1, nnsAddr)
          // On ENS through the proxy
          net.ensAddress = ens.registry.address
          const ensAddr = await ethers.provider.resolveName(`${name}.proxy.eth`)
          assert.equal(w1, ensAddr)
        })
      },
    )
  })
})

function dnsName(name) {
  // strip leading and trailing .
  const n = name.replace(/^\.|\.$/gm, '')

  var bufLen = n === '' ? 1 : n.length + 2
  var buf = Buffer.allocUnsafe(bufLen)

  offset = 0
  if (n.length) {
    const list = n.split('.')
    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }
  buf[offset++] = 0
  return (
    '0x' +
    buf.reduce(
      (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
      '',
    )
  )
}
