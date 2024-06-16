// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "../pricing/USDPricingOracle.sol";

contract USDETHAggregatorMock is IAggregator {
    uint256 _multiplier;

    constructor(uint256 multiplier) {
        _multiplier = multiplier;
    }

    function decimals() public pure returns (uint8) {
        return 8;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, int256(_multiplier * 10 ** decimals()), 0, 0, 1);
    }
}
