// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";
import "./IPricingOracle.sol";

interface ICldFactory {
    function createCld(
        string calldata name,
        address minter,
        address communityManager
    ) external returns (IRegistry);
}
