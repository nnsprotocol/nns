// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";

interface IRewarder {
    event CldRegistered(
        uint256 cldID,
        address target,
        uint8 referralShare,
        uint8 communityShare,
        uint8 ecosystemShare
    );
    event Collected(
        uint256 cldId,
        address referer,
        uint256 amountEth,
        uint256 amountERC20
    );
    event BalanceChanged(address accont, uint256 delta, uint256 amount);
    event Withdrawn(address account, uint256 amount);

    function balanceOf(address account) external view returns (uint256);

    function balanceOf(
        uint256 cldId,
        uint256 tokenId
    ) external view returns (uint256);

    function registerCld(
        IRegistry registry,
        address target,
        uint8 referralShare,
        uint8 communityShare,
        bool isCldSplitRewards
    ) external;

    struct CldConfiguration {
        uint8 referralShare;
        uint8 communityShare;
        uint8 ecosystemShare;
        uint8 protocolShare;
        bool isCldSplitRewards;
        address payoutTarget;
        IRegistry registry;
    }

    function configurationOf(
        uint256 cldId
    ) external returns (CldConfiguration memory);

    function collect(uint256 cldId, address referer) external payable;

    function withdrawForCommunity(
        uint256 cldId,
        uint256[] calldata cldIds,
        uint256[] calldata tokenIds
    ) external;

    function withdraw(
        uint256[] calldata cldIds,
        uint256[] calldata tokenIds
    ) external;
}