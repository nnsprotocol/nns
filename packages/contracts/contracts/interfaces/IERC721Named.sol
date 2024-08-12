// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IERC721Named {
    function nameOf(uint256 tokenId) external view returns (string memory);
}
