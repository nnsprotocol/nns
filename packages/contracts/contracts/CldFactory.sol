// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/ICldFactory.sol";
import "./CldRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CldFactory is ICldFactory, Ownable {
    constructor() Ownable(_msgSender()) {}

    function createCld(
        string calldata name,
        address minter,
        address communityManager
    ) external onlyOwner returns (IRegistry) {
        return new CldRegistry(name, minter, communityManager);
    }
}
