// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";
import "./IERC721Reward.sol";
import "./IERC721BasedRewarder.sol";
import "./IAccountRewarder.sol";

interface IRewarder {
    event CldRegistered(uint256 cldId);
    event CldConfigurationChanged(
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
    event Withdrawn(
        address account,
        uint256[] holderTokenIds,
        uint256[] ecosystemTokenIds,
        uint256 amount
    );

    error CldAlreadyRegistered(uint256 cldId);
    error InvalidCld(uint256 cldId);
    error InvalidAccount(address account);
    error InvalidShares();
    error NothingToWithdraw();
    error CallerNotController(address addr);
    error CallerNotCommunityManager(uint256 cldId, address addr);

    struct CldConfiguration {
        uint8 referralShare;
        uint8 communityShare;
        uint8 ecosystemShare;
        uint8 protocolShare;
        address payoutTarget;
        IRegistry registry;
    }

    /** Registration of CLDs */
    function registerCld(
        IRegistry registry,
        address target,
        uint8 referralShare,
        uint8 communityShare
    ) external;

    function configurationOf(
        uint256 cldId
    ) external returns (CldConfiguration memory);

    function setCldConfiguration(
        uint256 cldId,
        address target,
        uint8 referralShare,
        uint8 communityShare
    ) external;

    /** Collection of rewards */
    function collect(uint256 cldId, address referer) external payable;

    /** Admin */
    function setController(address controller) external;

    function setEcosystemRewarder(IERC721BasedRewarder rewarder) external;

    function setHolderRewarder(IERC721BasedRewarder rewarder) external;

    function setAccountRewarder(IAccountRewarder rewarder) external;

    /** Rewarders */
    function ecosystemRewarder() external view returns (IERC721BasedRewarder);

    function holderRewarder() external view returns (IERC721BasedRewarder);

    function accountRewarder() external view returns (IAccountRewarder);

    /** Withdraw */
    function balanceOf(
        address account,
        uint256[] calldata holderTokenIds,
        uint256[] calldata ecosystemTokenIds
    ) external view returns (uint256);

    function withdraw(
        address account,
        uint256[] calldata holderTokenIds,
        uint256[] calldata ecosystemTokenIds
    ) external;
}
