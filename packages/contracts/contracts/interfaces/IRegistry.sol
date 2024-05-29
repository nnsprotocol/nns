// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IRegistry is IERC721 {
    function totalSupply() external view returns (uint256);

    function mintTLD(string memory name) external returns (uint256 tokenId);

    function mint(
        address to,
        string[] calldata labels,
        bool withReverse
    ) external;

    function namehash(
        string[] calldata labels
    ) external pure returns (uint256 hash);
}
