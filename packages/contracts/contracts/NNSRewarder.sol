// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IRegistry.sol";
import "./interfaces/IERC721Reward.sol";
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

    IERC721RewardSplitter internal _holderRewardSplitter;
    IERC721RewardSplitter internal _ecosystemRewardSplitter;

    IERC20 _rewardToken;
    ISwapRouter internal _swapRouter;
    IERC20 internal _weth9;

    uint256 internal _holdersBalance;
    uint256 internal _ecosystemBalance;
    address internal _controller;

    function setController(address controller) external onlyOwner {
        _controller = controller;
    }

    modifier onlyController() {
        if (_msgSender() != _controller) {
            revert CallerNotController(_msgSender());
        }
        _;
    }

    function setHolderRewardSplitter(
        IERC721RewardSplitter splitter
    ) external onlyOwner {
        _holderRewardSplitter = splitter;
        emit HolderRewardSplitterChanged(address(splitter));
    }

    function setEcosystemRewardSplitter(
        IERC721RewardSplitter splitter
    ) external onlyOwner {
        _ecosystemRewardSplitter = splitter;
        emit EcosystemRewardSplitterChanged(address(splitter));
    }

    function holderRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory)
    {
        return _holderRewardSplitter.lastSnapshot();
    }

    function takeHolderRewardsSnapshot() external {
        _holdersBalance = _holderRewardSplitter.takeSnapshot(_holdersBalance);
    }

    function previewHolderRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory)
    {
        (
            IERC721RewardSplitter.Snapshot memory snapshot,

        ) = _holderRewardSplitter.previewSnapshot(_holdersBalance);
        return snapshot;
    }

    function takeEcosystemRewardsSnapshot() external {
        _ecosystemBalance = _ecosystemRewardSplitter.takeSnapshot(
            _ecosystemBalance
        );
    }

    function previewEcosystemRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory)
    {
        (
            IERC721RewardSplitter.Snapshot memory snapshot,

        ) = _ecosystemRewardSplitter.previewSnapshot(_ecosystemBalance);
        return snapshot;
    }

    function ecosystemRewardsSnapshot()
        external
        view
        returns (IERC721RewardSplitter.Snapshot memory)
    {
        return _ecosystemRewardSplitter.lastSnapshot();
    }

    constructor(
        ISwapRouter swapRouter,
        IERC20 rewardToken,
        IERC20 weth9,
        address protocol
    ) Ownable(_msgSender()) {
        _swapRouter = swapRouter;
        _rewardToken = rewardToken;
        _weth9 = weth9;
        _protocol = protocol;
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
                _communityPayables[cldId],
                registry
            );
    }

    function registerCld(
        IRegistry registry,
        address payout,
        uint8 referralShare,
        uint8 communityShare
    ) external onlyController {
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
    ) external payable onlyController {
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
        if (ecosystemAmount > 0) {
            _ecosystemBalance += ecosystemAmount;
            emit EcosystemBalanceChanged(ecosystemAmount, _ecosystemBalance);
        }

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

    function withdraw(address account, uint256[] calldata tokenIds) public {
        uint256 amount = _withdraw(
            account,
            tokenIds,
            true,
            _holderRewardSplitter
        );
        emit Withdrawn(account, tokenIds, amount);
    }

    function withdrawForCommunity(
        uint256 cldId,
        uint256[] calldata tokenIds
    ) external {
        withdraw(_communityPayables[cldId], tokenIds);
    }

    function withdrawEcosystem(
        address account,
        uint256[] calldata tokenIds
    ) external {
        uint256 amount = _withdraw(
            account,
            tokenIds,
            false,
            _ecosystemRewardSplitter
        );
        emit WithdrawnEcosystem(account, tokenIds, amount);
    }

    function _withdraw(
        address account,
        uint256[] calldata tokenIds,
        bool includeAccountBalance,
        IERC721RewardSplitter splitter
    ) internal returns (uint256 amount) {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }
        amount = 0;
        if (includeAccountBalance) {
            amount = balanceOf(account);
        }
        for (uint256 i = 0; i < tokenIds.length; i++) {
            amount += splitter.issueReward(account, tokenIds[i]);
        }
        if (amount == 0) {
            revert NothingToWithdraw();
        }
        _walletBalances[account] = 0;
        SafeERC20.safeTransfer(_rewardToken, account, amount);
        return amount;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _walletBalances[account];
    }

    function balanceOf(uint256 tokenId) public view returns (uint256) {
        return _holderRewardSplitter.balanceOf(tokenId);
    }

    function ecosystemBalanceOf(
        uint256 tokenId
    ) external view returns (uint256) {
        return _ecosystemRewardSplitter.balanceOf(tokenId);
    }

    function balanceOfHolders() external view returns (uint256) {
        return _holdersBalance;
    }

    function balanceOfEcosystem() external view returns (uint256) {
        return _ecosystemBalance;
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
