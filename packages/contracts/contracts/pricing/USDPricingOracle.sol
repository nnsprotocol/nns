// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "../interfaces/IPricingOracle.sol";

interface IAggregator {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract USDPricingOracle is IPricingOracle {
    uint256[] _prices;
    IAggregator _aggregator;

    constructor(uint256[] memory prices, IAggregator aggregator) {
        _prices = prices;
        _aggregator = aggregator;
    }

    function price(string calldata name) external view returns (uint256) {
        uint256 len = bytes(name).length - 1;
        if (len >= _prices.length) {
            len = _prices.length - 1;
        }
        uint8 ethPriceDecimals = _aggregator.decimals();
        (, int256 ethPrice, , , ) = _aggregator.latestRoundData();
        uint256 usdEth = uint256(ethPrice) * 10 ** (18 - ethPriceDecimals);

        uint256 usd = _prices[len];

        return (usd * 10 ** 18) / usdEth;
    }
}
