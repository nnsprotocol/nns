// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "../interfaces/IPricingOracle.sol";

contract ConstantPricingOracle is IPricingOracle {
    uint256 _price;

    constructor(uint256 amount) {
        _price = amount;
    }

    function price(string calldata) external view returns (uint256) {
        return _price;
    }
}
