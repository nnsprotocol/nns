// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IERC721Reward.sol";
import "./IERC721Named.sol";

interface IERC721Resolver is IERC721Rewardable, IERC721Named {
    function mint(address to, string calldata name) external;

    function burn(string calldata name) external;
}
