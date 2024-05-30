// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/ICldFactory.sol";
import "./CldRegistry.sol";

contract CldFactory is ICldFactory {
    function createCld(
        string calldata name,
        address minter,
        address communityManager
    ) external returns (IRegistry) {
        return new CldRegistry(name, name, minter, communityManager);
    }
}
