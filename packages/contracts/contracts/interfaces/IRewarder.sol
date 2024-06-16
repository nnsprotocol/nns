// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";

interface IRewarder {
    event CldRegistered(
        uint256 cldId,
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
    event Withdrawn(address account, uint256[] tokenIds, uint256 amount);
    event HoldersBalanceChanged(uint256 delta, uint256 amount);
    event HolderRewardsSnapshotCreated(HolderRewardsSnapshot);

    error CldAlreadyRegistered(uint256 cldId);
    error InvalidCld(uint256 cldId);
    error InvalidAccount(address account);
    error TokenNotOwned(
        address account,
        uint256 cldId,
        address registry,
        uint256 tokenId
    );
    error TokenNotInSnapshot(
        uint256 tokenId,
        uint256 mintBlock,
        uint256 snapshotBlock
    );
    error InvalidShares();
    error HoldersSnapshotTooEarly();
    error NothingToWithdraw();

    struct CldConfiguration {
        uint8 referralShare;
        uint8 communityShare;
        uint8 ecosystemShare;
        uint8 protocolShare;
        bool isCldSplitRewards;
        address payoutTarget;
        IRegistry registry;
    }

    function balanceOf(address account) external view returns (uint256);

    function balanceOf(uint256 tokenId) external view returns (uint256);

    function balanceOfHolders() external view returns (uint256);

    function registerCld(
        IRegistry registry,
        address target,
        uint8 referralShare,
        uint8 communityShare,
        bool isCldSplitRewards
    ) external;

    function configurationOf(
        uint256 cldId
    ) external returns (CldConfiguration memory);

    function collect(uint256 cldId, address referer) external payable;

    function withdrawForCommunity(
        uint256 cldId,
        uint256[] calldata tokenIds
    ) external;

    function withdraw(address account, uint256[] calldata tokenIds) external;

    struct HolderRewardsSnapshot {
        uint256 reward;
        uint256 supply;
        uint256 unclaimed;
        uint256 blockNumber;
        uint256 blockTimestamp;
    }

    function takeHolderRewardsSnapshot() external;

    function previewHolderRewardsSnapshot()
        external
        view
        returns (HolderRewardsSnapshot memory);

    function holderRewardsSnapshot()
        external
        view
        returns (HolderRewardsSnapshot memory);
}
