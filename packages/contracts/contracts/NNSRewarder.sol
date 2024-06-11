// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract NNSRewarder is IRewarder, Ownable {
    uint8 public constant PROTOCOL_SHARE = 5;

    address _protocol;
    mapping(address => uint256) private _walletBalances;

    mapping(uint256 cldId => uint8) _communityRewards;
    mapping(uint256 cldId => address) _communityPayables;
    mapping(uint256 cldId => uint8) _referralRewards;
    mapping(uint256 cldId => IRegistry) _registries;
    IRegistry _registrySplitRewards;

    IERC20 _rewardToken;
    ISwapRouter internal _swapRouter;
    IERC20 internal _weth9;

    uint256 internal _holdersBalance;
    HolderRewardsSnapshot internal _holderRewardsSnapshot;
    mapping(uint256 block => mapping(uint256 tokenId => bool)) _claimedTokens;

    uint256 internal _minSnapshotInterval;

    function holderRewardsSnapshot()
        external
        view
        returns (HolderRewardsSnapshot memory)
    {
        return _holderRewardsSnapshot;
    }

    function takeHolderRewardsSnapshot() external {
        if (
            _holderRewardsSnapshot.blockTimestamp + _minSnapshotInterval >
            block.timestamp
        ) {
            revert HoldersSnapshotTooEarly();
        }

        (
            _holderRewardsSnapshot,
            _holdersBalance
        ) = _calculateHolderRewardsSnapshot();
        emit HolderRewardsSnapshotCreated(_holderRewardsSnapshot);
    }

    function _calculateHolderRewardsSnapshot()
        internal
        view
        returns (HolderRewardsSnapshot memory snapshot, uint256 reminder)
    {
        uint256 balance = _holdersBalance + _holderRewardsSnapshot.unclaimed;
        uint256 supply = _registrySplitRewards.totalSupply();
        uint256 reward = balance / supply;
        snapshot = HolderRewardsSnapshot(
            reward,
            supply,
            balance,
            block.number,
            block.timestamp
        );
        reminder = balance % supply;
    }

    function previewHolderRewardsSnapshot()
        external
        view
        returns (HolderRewardsSnapshot memory)
    {
        (
            HolderRewardsSnapshot memory snapshot,

        ) = _calculateHolderRewardsSnapshot();
        return snapshot;
    }

    constructor(
        ISwapRouter swapRouter,
        IERC20 rewardToken,
        IERC20 weth9,
        address protocol,
        uint256 minSnapshotInterval
    ) Ownable(msg.sender) {
        _swapRouter = swapRouter;
        _rewardToken = rewardToken;
        _weth9 = weth9;
        _protocol = protocol;
        _minSnapshotInterval = minSnapshotInterval;
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
                _referralRewards[cldId],
                _communityRewards[cldId],
                _ecosytemShare(cldId),
                PROTOCOL_SHARE,
                registry == _registrySplitRewards,
                _communityPayables[cldId],
                registry
            );
    }

    function registerCld(
        IRegistry registry,
        address payout,
        uint8 referralShare,
        uint8 communityShare,
        bool isCldSplitRewards
    ) external onlyOwner {
        if (referralShare + communityShare + PROTOCOL_SHARE > 100) {
            revert InvalidShares();
        }

        (, uint256 cldId) = registry.cld();
        if (address(_registries[cldId]) != address(0)) {
            revert CldAlreadyRegistered(cldId);
        }

        _communityPayables[cldId] = payout;
        _communityRewards[cldId] = communityShare;
        _referralRewards[cldId] = referralShare;
        _registries[cldId] = registry;
        if (isCldSplitRewards) {
            _registrySplitRewards = registry;
        }
        emit CldRegistered(
            cldId,
            payout,
            referralShare,
            communityShare,
            _ecosytemShare(cldId)
        );
    }

    function collect(
        uint256 cldId,
        address referer
    ) external payable onlyOwner {
        _requireRegistryOf(cldId);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams(
                address(_weth9),
                address(_rewardToken),
                3000,
                address(this),
                block.timestamp + 15,
                address(this).balance,
                0,
                0
            );

        uint256 totalAmount = _swapRouter.exactInputSingle{
            value: address(this).balance
        }(params);

        // Referral
        if (referer == address(0)) {
            referer = _communityPayables[cldId];
        }
        uint256 refererAmount = (totalAmount * _referralRewards[cldId]) / 100;
        _walletBalances[referer] += refererAmount;
        emit BalanceChanged(referer, refererAmount, _walletBalances[referer]);

        // Community
        uint256 communityAmount = (totalAmount * _communityRewards[cldId]) /
            100;
        _walletBalances[_communityPayables[cldId]] += communityAmount;
        emit BalanceChanged(
            _communityPayables[cldId],
            communityAmount,
            _walletBalances[_communityPayables[cldId]]
        );

        // Protocol
        uint256 protocolAmount = (totalAmount * PROTOCOL_SHARE) / 100;
        _walletBalances[_protocol] += protocolAmount;
        emit BalanceChanged(
            _protocol,
            protocolAmount,
            _walletBalances[_protocol]
        );

        // Ecosystem + Users
        uint256 ecosystemAmount = (totalAmount * _ecosytemShare(cldId)) / 100;

        uint256 usersAmount = totalAmount -
            refererAmount -
            communityAmount -
            ecosystemAmount -
            protocolAmount;
        if (usersAmount > 0) {
            _holdersBalance += usersAmount;
            emit HoldersBalanceChanged(usersAmount, _holdersBalance);
        }

        emit Collected(cldId, referer, msg.value, totalAmount);
    }

    function _ecosytemShare(uint256 cldId) internal view returns (uint8) {
        return
            (100 -
                _communityRewards[cldId] -
                _referralRewards[cldId] -
                PROTOCOL_SHARE) / 2;
    }

    function withdraw(address account, uint256[] calldata tokenIds) external {
        _withdraw(account, tokenIds);
    }

    function withdrawForCommunity(
        uint256 cldId,
        uint256[] calldata tokenIds
    ) external {
        _withdraw(_communityPayables[cldId], tokenIds);
    }

    function _withdraw(address account, uint256[] calldata tokenIds) internal {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }
        uint256 amount = balanceOf(account);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            amount += _processTokenReward(account, tokenIds[i]);
        }
        if (amount == 0) {
            revert NothingToWithdraw();
        }
        _walletBalances[account] = 0;
        SafeERC20.safeTransfer(_rewardToken, account, amount);
        emit Withdrawn(account, tokenIds, amount);
    }

    function _processTokenReward(
        address account,
        uint256 tokenId
    ) internal returns (uint256) {
        if (_claimedTokens[_holderRewardsSnapshot.blockNumber][tokenId]) {
            return 0;
        }
        if (_registrySplitRewards.ownerOf(tokenId) != account) {
            (, uint256 cldId) = _registrySplitRewards.cld();
            revert TokenNotOwned(
                account,
                cldId,
                address(_registrySplitRewards),
                tokenId
            );
        }
        uint256 mintBlock = _registrySplitRewards.mintBlockNumberOf(tokenId);
        if (mintBlock > _holderRewardsSnapshot.blockNumber) {
            revert TokenNotInSnapshot(
                tokenId,
                mintBlock,
                _holderRewardsSnapshot.blockNumber
            );
        }
        _holderRewardsSnapshot.unclaimed -= _holderRewardsSnapshot.reward;
        _claimedTokens[_holderRewardsSnapshot.blockNumber][tokenId] = true;
        return _holderRewardsSnapshot.reward;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _walletBalances[account];
    }

    function balanceOf(uint256 tokenId) public view returns (uint256) {
        uint256 tokenBlock = _registrySplitRewards.mintBlockNumberOf(tokenId);
        if (tokenBlock > _holderRewardsSnapshot.blockNumber) {
            return 0;
        }
        if (_claimedTokens[_holderRewardsSnapshot.blockNumber][tokenId]) {
            return 0;
        }
        return _holderRewardsSnapshot.reward;
    }

    function balanceOfHolders() external view returns (uint256) {
        return _holdersBalance;
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
}
