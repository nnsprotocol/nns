// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import '@openzeppelin/contracts/utils/introspection/ERC165Checker.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import '../registry/ENS.sol';
import './profiles/IAddrResolver.sol';
import './profiles/IAddressResolver.sol';
import './profiles/INameResolver.sol';
import './profiles/IExtendedResolver.sol';
import '../wrapper/BytesUtil.sol';
import 'hardhat/console.sol';

contract ENSProxyResolver is ERC165, IExtendedResolver {
  using BytesUtils for bytes;

  ENS private immutable registry;
  bytes32 private immutable baseNode;
  uint256 private proxyDomainDNSLength;

  constructor(
    ENS _registry,
    bytes32 _baseNode,
    uint256 _proxyDomainDNSLength
  ) {
    registry = _registry;
    baseNode = _baseNode;
    proxyDomainDNSLength = _proxyDomainDNSLength;
  }

  function resolve(bytes calldata name, bytes calldata data)
    external
    view
    returns (bytes memory)
  {
    require(
      bytes4(data[0:4]) == bytes4(0x3b3b57de),
      'only addr(byte32) is supported'
    );

    bytes memory nnsName = _removeProxyDomain(name);
    bytes32 node = nnsName.namehash(0, baseNode);
    address resolver = registry.resolver(node);

    if (resolver == address(0)) {
      return new bytes(0);
    }
    (, bytes memory res) = resolver.staticcall(
      abi.encodeWithSelector(bytes4(0x3b3b57de), node)
    );
    return res;
  }

  function _removeProxyDomain(bytes calldata name)
    private
    view
    returns (bytes memory)
  {
    require(name.length > proxyDomainDNSLength, "name doesn't contain proxy");

    // name is dns-encoded with the proxy domain at the end and we need to remove it.
    // Eg: apbigcod.proxy.eth -> apbigcod
    // The last byte is the final 0x00.

    // name.length includes the trailing zero
    // proxyDomainDNSLength includes the trailing zero
    // +1 to add the traling zero back.
    bytes memory noproxy = new bytes(name.length - proxyDomainDNSLength + 1);
    // Copy the name up the the start of the proxy name.
    uint256 i;
    for (i = 0; i < name.length - proxyDomainDNSLength; i++) {
      noproxy[i] = name[i];
    }
    // Final empty byte.
    noproxy[noproxy.length - 1] = 0x00;
    return noproxy;
  }

  function supportsInterface(bytes4 interfaceID)
    public
    view
    virtual
    override
    returns (bool)
  {
    return
      interfaceID == type(IExtendedResolver).interfaceId ||
      super.supportsInterface(interfaceID);
  }
}
