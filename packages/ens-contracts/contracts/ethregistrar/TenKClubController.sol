pragma solidity >=0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import './BaseRegistrarImplementation.sol';

contract TenKClubController is Ownable {
  struct Claim {
    uint64 ttl;
  }

  mapping(address => Claim[]) public claims;
  BaseRegistrarImplementation base;

  constructor(BaseRegistrarImplementation _base) {
    base = _base;
  }

  function register() public {}
}
