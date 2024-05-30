// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IRegistry is IERC721 {
    function totalSupply() external view returns (uint256);

    function cld() external view returns (string memory name, uint256 id);

    function nameOf(uint256 tokenId) external view returns (string memory);

    function reverseOf(address addr) external view returns (uint256 tokenId);

    function reverseNameOf(address addr) external view returns (string memory);

    function mintOrUnlock(
        address to,
        string calldata name,
        bool withReverse
    ) external returns (uint256 tokenId);

    function namehash(string calldata name) external pure returns (uint256);

    function isApprovedOrOwner(
        address addr,
        uint256 tokenId
    ) external view returns (bool);

    function hasCommunityRole(address account) external view returns (bool);

    function transferCommunityRole(address newAccount) external;

    function expiryOf(uint256 tokenId) external view returns (uint256);

    function isExpired(uint256 tokenId) external view returns (bool);

    function setExpiry(uint256 tokenId, uint256 expiry) external;
}
