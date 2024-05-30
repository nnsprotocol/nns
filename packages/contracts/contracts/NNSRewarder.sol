// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "hardhat/console.sol";

contract NNSRewarder is IRewarder, Ownable {
    uint8 public constant PROTOCOL_SHARE = 5;

    address _protocol;
    mapping(address => uint256) private _walletBalances;

    uint256 private _cldTokenBalance;
    mapping(uint256 => mapping(uint256 => uint256)) _withdrawPerToken;

    mapping(uint256 => uint8) _communityRewards;
    mapping(uint256 => address) _communityPayables;
    mapping(uint256 => uint8) _referralRewards;
    mapping(uint256 => IRegistry) _registries;
    IRegistry _registrySplitRewards;

    IERC20 _rewardToken;
    ISwapRouter internal _swapRouter;
    IERC20 internal _weth9;

    constructor(
        ISwapRouter swapRouter,
        IERC20 rewardToken,
        IERC20 weth9
    ) Ownable(msg.sender) {
        _swapRouter = swapRouter;
        _rewardToken = rewardToken;
        _weth9 = weth9;
    }

    function configurationOf(
        uint256 cldId
    ) external view returns (IRewarder.CldConfiguration memory) {
        IRegistry registry = _registries[cldId];
        if (address(registry) == address(0)) {
            return
                IRewarder.CldConfiguration(
                    0,
                    0,
                    0,
                    0,
                    false,
                    address(0),
                    IRegistry(address(0))
                );
        }

        return
            IRewarder.CldConfiguration(
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
        require(referralShare + communityShare + PROTOCOL_SHARE <= 100);

        (, uint256 cldId) = registry.cld();

        _communityPayables[cldId] = payout;
        _communityRewards[cldId] = communityShare;
        _referralRewards[cldId] = referralShare;
        _registries[cldId] = registry;
        if (isCldSplitRewards) {
            _registrySplitRewards = registry;
        }
        emit IRewarder.CldRegistered(
            cldId,
            payout,
            referralShare,
            communityShare,
            _ecosytemShare(cldId)
        );
    }

    function collect(uint256 cldId, address referer) external payable {
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
        _walletBalances[referer] +=
            (totalAmount * _referralRewards[cldId]) /
            100;

        // Community
        _walletBalances[_communityPayables[cldId]] +=
            (totalAmount * _communityRewards[cldId]) /
            100;

        // Protocol
        _walletBalances[_protocol] += (totalAmount * PROTOCOL_SHARE) / 100;

        // Ecosystem + Users
        uint8 ecosystem = _ecosytemShare(cldId);
        uint256 usersEcosystemAmount = (totalAmount * ecosystem) / 100 / 2;

        _cldTokenBalance +=
            usersEcosystemAmount /
            _registrySplitRewards.totalSupply();

        emit Collected(cldId, referer, msg.value, totalAmount);
    }

    function _ecosytemShare(uint256 cldId) internal view returns (uint8) {
        return
            100 -
            _communityRewards[cldId] -
            _referralRewards[cldId] -
            PROTOCOL_SHARE;
    }

    function withdraw(
        uint256[] calldata cldIds,
        uint256[] calldata tokenIds
    ) external {
        _withdraw(msg.sender, cldIds, tokenIds);
    }

    function withdrawForCommunity(
        uint256 cldId,
        uint256[] calldata cldIds,
        uint256[] calldata tokenIds
    ) external {
        _withdraw(_communityPayables[cldId], cldIds, tokenIds);
    }

    function _withdraw(
        address account,
        uint256[] calldata cldIds,
        uint256[] calldata tokenIds
    ) internal {
        require(cldIds.length == tokenIds.length);
        require(account != address(0));
        uint256 amount = balanceOf(account);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            amount += _processTokenReward(account, cldIds[i], tokenIds[i]);
        }
        require(amount > 0);
        _walletBalances[account] = 0;
        SafeERC20.safeTransfer(_rewardToken, account, amount);
    }

    function _processTokenReward(
        address account,
        uint256 cldId,
        uint256 tokenId
    ) internal returns (uint256) {
        IRegistry registry = _registries[cldId];
        require(address(registry) != address(0));
        require(registry.ownerOf(tokenId) == account);
        uint256 amount = balanceOf(cldId, tokenId);
        if (amount > 0) {
            _withdrawPerToken[cldId][tokenId] += amount;
        }
        return amount;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _walletBalances[account];
    }

    function balanceOf(
        uint256 cldId,
        uint256 tokenId
    ) public view returns (uint256) {
        return _cldTokenBalance - _withdrawPerToken[cldId][tokenId];
    }
}
