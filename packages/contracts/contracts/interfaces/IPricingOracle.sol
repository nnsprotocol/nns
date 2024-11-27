// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IPricingOracle {
    function price(string calldata name) external view returns (uint256);
}