// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IPricingOracle.sol";

contract ConstantPricingOracle is IPricingOracle {
    function price(string calldata) external pure returns (uint256) {
        return 1 wei;
    }
}
