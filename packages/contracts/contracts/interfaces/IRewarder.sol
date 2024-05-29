// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IRewarder {
    event CommunityRegistered(
        uint256 tldID,
        address target,
        uint8 referralShare,
        uint8 communityShare
    );
    event Collected(uint256 tldId, address referer, uint256 amount);
    event BalanceChanged(address accont, uint256 delta, uint256 amount);
    event Withdrawn(address account, uint256 amount);

    function balanceOf(address account) external view returns (uint256);

    function balanceOf(uint256 tokenId) external view returns (uint256);

    function registerCommunity(
        uint256 tldID,
        address target,
        uint8 referralShare,
        uint8 communityShare
    ) external;

    function collect(uint256 tldId, address referer) external payable;

    function withdrawForCommunity(
        uint256 tldId,
        uint256[] calldata tokenIds
    ) external;

    function withdraw(uint256[] calldata tokenIds) external;
}
