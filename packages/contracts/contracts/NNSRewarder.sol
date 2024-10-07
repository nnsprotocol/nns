// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IRegistry.sol";
import "./interfaces/IERC721Reward.sol";
import "./interfaces/IAccountRewarder.sol";
import "./interfaces/IERC721BasedRewarder.sol";
import "./interfaces/IV3SwapRouter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NNSRewarder is IRewarder, Ownable {
    uint8 public constant PROTOCOL_SHARE = 5;

    address internal _protocol;

    mapping(uint256 cldId => uint8) internal _communityShare;
    mapping(uint256 cldId => address) internal _communityPayables;
    mapping(uint256 cldId => uint8) internal _referralShare;
    mapping(uint256 cldId => uint8) internal _ecosystemShare;
    mapping(uint256 cldId => IRegistry) internal _registries;

    IERC721BasedRewarder internal _ecosystemRewarder;
    IERC721BasedRewarder internal _holderRewarder;
    IAccountRewarder internal _accountRewarder;

    IERC20 internal _rewardToken;
    IV3SwapRouter internal _swapRouter;
    IERC20 internal _weth9;

    address internal _controller;

    constructor(
        IV3SwapRouter swapRouter,
        IERC20 rewardToken,
        IERC20 weth9,
        address protocol
    ) Ownable(_msgSender()) {
        _swapRouter = swapRouter;
        _rewardToken = rewardToken;
        _weth9 = weth9;
        _protocol = protocol;
    }

    function setController(address controller) external onlyOwner {
        _controller = controller;
    }

    modifier onlyController() {
        if (_msgSender() != _controller) {
            revert CallerNotController(_msgSender());
        }
        _;
    }

    function setEcosystemRewarder(
        IERC721BasedRewarder rewarder
    ) external onlyOwner {
        _ecosystemRewarder = rewarder;
    }

    function setHolderRewarder(
        IERC721BasedRewarder rewarder
    ) external onlyOwner {
        _holderRewarder = rewarder;
    }

    function setAccountRewarder(IAccountRewarder rewarder) external onlyOwner {
        _accountRewarder = rewarder;
    }

    function configurationOf(
        uint256 cldId
    ) external view returns (CldConfiguration memory c) {
        IRegistry registry = _registries[cldId];
        if (address(registry) == address(0)) {
            return c;
        }

        return
            CldConfiguration(
                _referralShare[cldId],
                _communityShare[cldId],
                _ecosystemShare[cldId],
                PROTOCOL_SHARE,
                _communityPayables[cldId],
                registry
            );
    }

    function setCldConfiguration(
        uint256 cldId,
        address target,
        uint8 referralShare,
        uint8 communityShare,
        uint8 ecosystemShare
    ) external {
        IRegistry registry = _requireRegistryOf(cldId);
        if (!registry.hasCommunityRole(_msgSender())) {
            revert CallerNotCommunityManager(cldId, _msgSender());
        }
        _setCldConfiguration(
            cldId,
            target,
            referralShare,
            communityShare,
            ecosystemShare
        );
    }

    function _setCldConfiguration(
        uint256 cldId,
        address target,
        uint8 referralShare,
        uint8 communityShare,
        uint8 ecosystemShare
    ) internal {
        if (
            referralShare + communityShare + ecosystemShare + PROTOCOL_SHARE >
            100
        ) {
            revert InvalidShares();
        }
        _communityPayables[cldId] = target;
        _communityShare[cldId] = communityShare;
        _referralShare[cldId] = referralShare;
        _ecosystemShare[cldId] = ecosystemShare;
        emit CldConfigurationChanged(
            cldId,
            target,
            referralShare,
            communityShare,
            ecosystemShare
        );
    }

    function registerCld(
        IRegistry registry,
        address payout,
        uint8 referralShare,
        uint8 communityShare,
        uint8 ecosystemShare
    ) external onlyController {
        (, uint256 cldId) = registry.cld();
        if (address(_registries[cldId]) != address(0)) {
            revert CldAlreadyRegistered(cldId);
        }
        _registries[cldId] = registry;
        emit CldRegistered(cldId);

        _setCldConfiguration(
            cldId,
            payout,
            referralShare,
            communityShare,
            ecosystemShare
        );
    }

    function collect(
        uint256 cldId,
        address referer
    ) external payable onlyController {
        _requireRegistryOf(cldId);

        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter
            .ExactInputSingleParams(
                address(_weth9),
                address(_rewardToken),
                3000,
                address(this),
                address(this).balance,
                0,
                0
            );

        uint256 totalAmount = _swapRouter.exactInputSingle{
            value: address(this).balance
        }(params);

        // Referral
        address originalReferer = referer;
        if (
            referer == address(0) ||
            (referer != address(0) &&
                IERC721(_holderRewarder.erc721()).balanceOf(referer) == 0)
        ) {
            referer = _communityPayables[cldId];
        }
        uint256 refererAmount = (totalAmount * _referralShare[cldId]) / 100;
        _accountRewarder.incrementBalanceOf(referer, refererAmount);

        // Community
        uint256 communityAmount = (totalAmount * _communityShare[cldId]) / 100;
        _accountRewarder.incrementBalanceOf(
            _communityPayables[cldId],
            communityAmount
        );

        // Protocol
        uint256 protocolAmount = (totalAmount * PROTOCOL_SHARE) / 100;
        _accountRewarder.incrementBalanceOf(_protocol, protocolAmount);

        // Ecosystem
        uint256 ecosystemAmount = (totalAmount * _ecosystemShare[cldId]) / 100;
        _ecosystemRewarder.incrementBalance(ecosystemAmount);

        uint256 holdersAmount = totalAmount -
            refererAmount -
            communityAmount -
            ecosystemAmount -
            protocolAmount;
        if (holdersAmount > 0) {
            _holderRewarder.incrementBalance(holdersAmount);
        }

        emit Collected(cldId, originalReferer, msg.value, totalAmount);
    }

    function _requireRegistryOf(
        uint256 cldId
    ) internal view returns (IRegistry) {
        IRegistry registry = _registries[cldId];
        if (address(registry) == address(0)) {
            revert InvalidCld(cldId);
        }
        return registry;
    }

    function ecosystemRewarder() external view returns (IERC721BasedRewarder) {
        return _ecosystemRewarder;
    }

    function holderRewarder() external view returns (IERC721BasedRewarder) {
        return _holderRewarder;
    }

    function accountRewarder() external view returns (IAccountRewarder) {
        return _accountRewarder;
    }

    function balanceOf(
        address account,
        uint256[] calldata holderTokenIds,
        uint256[] calldata ecosystemTokenIds
    ) external view returns (uint256) {
        uint256 amount = 0;
        for (uint256 i = 0; i < holderTokenIds.length; i++) {
            amount += _holderRewarder.balanceOf(holderTokenIds[i]);
        }
        for (uint256 i = 0; i < ecosystemTokenIds.length; i++) {
            amount += _ecosystemRewarder.balanceOf(ecosystemTokenIds[i]);
        }
        return amount + _accountRewarder.balanceOf(account);
    }

    function withdraw(
        address account,
        uint256[] calldata holderTokenIds,
        uint256[] calldata ecosystemTokenIds
    ) external {
        uint256 amount = 0;
        for (uint256 i = 0; i < holderTokenIds.length; i++) {
            amount += _holderRewarder.issueReward(account, holderTokenIds[i]);
        }
        for (uint256 i = 0; i < ecosystemTokenIds.length; i++) {
            amount += _ecosystemRewarder.issueReward(
                account,
                ecosystemTokenIds[i]
            );
        }
        amount += _accountRewarder.issueReward(account);
        if (amount == 0) {
            revert NothingToWithdraw();
        }
        SafeERC20.safeTransfer(_rewardToken, account, amount);
        emit Withdrawn(account, holderTokenIds, ecosystemTokenIds, amount);
    }
}
