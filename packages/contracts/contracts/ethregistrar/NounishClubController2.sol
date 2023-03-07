// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '../resolvers/Resolver.sol';
import './BaseRegistrarImplementation.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import 'hardhat/console.sol';

// NounishClubController registers a random name from 0 to 9999
// for accounts that have one or more claims available.
contract NounishClubController2 is Ownable {
  using ECDSA for bytes32;

  event NameRegistered(
    string name,
    bytes32 indexed label,
    address indexed owner
  );

  BaseRegistrarImplementation base;
  address private signer;
  mapping(uint256 => bool) usedNonces;

  constructor(BaseRegistrarImplementation _base, address _signer) {
    base = _base;
    signer = _signer;
  }

  // /**
  //   Registration
  // */
  function register(
    uint16 number,
    uint256 nonce,
    uint256 expiry,
    address resolver,
    address addr,
    bytes memory signature
  ) public {
    require(!usedNonces[nonce], 'nonce already used');

    bytes32 hash = keccak256(
      abi.encodePacked(msg.sender, number, nonce, expiry, resolver, addr)
    );
    address msgSigner = hash.toEthSignedMessageHash().recover(signature);
    require(msgSigner == signer, 'invalid signature');

    require(expiry > block.timestamp, 'expired');

    string memory name = Strings.toString(number);
    require(_available(name), 'not available');

    usedNonces[nonce] = true;
    _register(name, resolver, addr);
  }

  // Register the given name.
  function _register(
    string memory name,
    address resolver,
    address addr
  ) private {
    require(_available(name), 'name not available');

    bytes32 label = keccak256(bytes(name));
    uint256 tokenId = uint256(label);

    // Copied from NNSRegistrarControllerWithReservation.sol.
    if (resolver != address(0)) {
      // Set this contract as the (temporary) owner, giving it
      // permission to set up the resolver.
      base.register(tokenId, address(this));

      // The nodehash of this label
      bytes32 nodehash = keccak256(abi.encodePacked(base.baseNode(), label));

      // Set the resolver
      base.ens().setResolver(nodehash, resolver);

      // Configure the resolver
      if (addr != address(0)) {
        Resolver(resolver).setAddr(nodehash, addr);
      }

      // Now transfer full ownership to the expected owner
      base.reclaim(tokenId, msg.sender);
      base.transferFrom(address(this), msg.sender, tokenId);
    } else {
      require(addr == address(0));
      base.register(tokenId, msg.sender);
    }
    emit NameRegistered(name, label, msg.sender);
  }

  // Checks if the name is available in the registry and not blocked.
  function _available(string memory name) private view returns (bool) {
    bytes32 label = keccak256(bytes(name));
    uint256 tokenId = uint256(label);
    return base.available(tokenId);
  }

  // /**
  //   Name generation
  // */
  // function _nameAt(uint256 i) private view returns (uint256) {
  //   if (movedNames[i] > 0) {
  //     return movedNames[i];
  //   } else {
  //     return i;
  //   }
  // }

  // // draws the next number.
  // function _draw() private returns (uint256) {
  //   require(namesRemaining > 0, 'No names left');

  //   uint256 random = uint256(
  //     keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender))
  //   );
  //   uint16 i = uint16(random % namesRemaining);
  //   uint256 pickedName = _nameAt(i) + minValue;

  //   // Move the last card in the deck into position i
  //   movedNames[i] = _nameAt(namesRemaining - 1);
  //   movedNames[namesRemaining - 1] = 0;
  //   namesRemaining -= 1;

  //   return pickedName;
  // }

  // /** Claming */

  // // _consumeClaim consumes one non-expired claim or rejects the transaction.
  // function _consumeClaim() private {
  //   (uint64 idx, bool found) = _findNonExpiredClaim();
  //   require(found, 'no claims available');

  //   delete claims[msg.sender][idx];
  // }

  // // returns the index of the first non-expired claim for the sender and true or (0, false) when not found.
  // function _findNonExpiredClaim() private view returns (uint64, bool) {
  //   uint256[] memory list = claims[msg.sender];
  //   for (uint64 i = 0; i < list.length; i++) {
  //     uint256 expiry = list[i];
  //     if (_isClaimValid(expiry, block.timestamp)) {
  //       return (i, true);
  //     }
  //   }
  //   return (0, false);
  // }

  // // returns the number of valid claims for the given address.
  // function claimsCount(address owner, uint256 currentTimestamp)
  //   external
  //   view
  //   returns (uint64)
  // {
  //   uint64 count = 0;
  //   uint256[] memory list = claims[owner];
  //   for (uint64 i = 0; i < list.length; i++) {
  //     uint256 expiry = list[i];
  //     if (_isClaimValid(expiry, currentTimestamp)) {
  //       count++;
  //     }
  //   }
  //   return count;
  // }

  // // _isClaimValid returns true is the given claim is valid.
  // function _isClaimValid(uint256 expiry, uint256 currentTimestamp)
  //   private
  //   pure
  //   returns (bool)
  // {
  //   return expiry > currentTimestamp;
  // }

  // /** ADMIN */

  // // Adds the given labels to the deny list.
  // function addToDenyList(uint256[] calldata tokenIds) external onlyOwner {
  //   for (uint256 i = 0; i < tokenIds.length; i++) {
  //     require(base.available(tokenIds[i]), 'name must be available');
  //     if (!denyList[tokenIds[i]]) {
  //       denyList[tokenIds[i]] = true;
  //     }
  //   }
  // }

  // // Removes the given labels to the deny list.
  // function removeFromDenyList(uint256[] calldata tokenIds) external onlyOwner {
  //   for (uint256 i = 0; i < tokenIds.length; i++) {
  //     if (denyList[tokenIds[i]]) {
  //       delete denyList[tokenIds[i]];
  //     }
  //   }
  // }

  // // Removes the given labels to the deny list.
  // function createClaims(address[] calldata owners, uint64 expiry)
  //   external
  //   onlyOwner
  // {
  //   for (uint256 i = 0; i < owners.length; i++) {
  //     claims[owners[i]].push(expiry);
  //   }
  // }
}
