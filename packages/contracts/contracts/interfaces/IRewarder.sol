// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";
import "./IERC721Reward.sol";

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
    event WithdrawnEcosystem(
        address account,
        uint256[] tokenIds,
        uint256 amount
    );
    event HoldersBalanceChanged(uint256 delta, uint256 amount);
    event HolderRewardSplitterChanged(address value);
    event EcosystemRewardSplitterChanged(address value);
    event EcosystemBalanceChanged(uint256 delta, uint256 amount);

    error CldAlreadyRegistered(uint256 cldId);
    error InvalidCld(uint256 cldId);
    error InvalidAccount(address account);
    error InvalidShares();
    error NothingToWithdraw();
    error CallerNotController(address addr);

    struct CldConfiguration {
        uint8 referralShare;
        uint8 communityShare;
        uint8 ecosystemShare;
        uint8 protocolShare;
        address payoutTarget;
        IRegistry registry;
    }

    function balanceOf(address account) external view returns (uint256);

    function balanceOf(uint256 tokenId) external view returns (uint256);

    function ecosystemBalanceOf(
        uint256 tokenId
    ) external view returns (uint256);

    function balanceOfHolders() external view returns (uint256);

    function balanceOfEcosystem() external view returns (uint256);

    function registerCld(
        IRegistry registry,
        address target,
        uint8 referralShare,
        uint8 communityShare
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

    function withdrawEcosystem(
        address account,
        uint256[] calldata tokenIds
    ) external;

    function takeHolderRewardsSnapshot() external;

    function previewHolderRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory);

    function holderRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory);

    function setHolderRewardSplitter(IERC721RewardSplitter splitter) external;

    function takeEcosystemRewardsSnapshot() external;

    function previewEcosystemRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory);

    function ecosystemRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory);

    function setEcosystemRewardSplitter(
        IERC721RewardSplitter splitter
    ) external;
}
