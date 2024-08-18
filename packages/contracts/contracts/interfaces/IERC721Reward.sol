// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IERC721Rewardable {
    function totalSupply() external view returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address);

    function mintBlockNumberOf(uint256 tokenId) external view returns (uint256);
}
