// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IRegistry.sol";

contract Rewarder is IRewarder {
    uint8 public constant PROTOCOL_SHARE = 5;

    address _protocol;
    mapping(address => uint256) private _balances;

    uint256 private _ecosystemBalance;
    uint256 private _usersBalance;

    uint256 private _rewardPerToken;
    mapping(uint256 => uint256) _withdrawPerToken;

    mapping(uint256 => uint8) _communityRewards;
    mapping(uint256 => address) _communityPayables;
    mapping(uint256 => uint8) _referralRewards;

    IRegistry _registry;

    function registerCommunity(
        uint256 tldID,
        address target,
        uint8 referralShare,
        uint8 communityShare
    ) external {
        require(referralShare + communityShare + PROTOCOL_SHARE <= 100);
        _communityPayables[tldID] = target;
        _communityRewards[tldID] = communityShare;
        _referralRewards[tldID] = referralShare;
    }

    function collect(uint256 tldId, address referer) external payable {
        uint256 totalAmount = msg.value;

        // Referral
        if (referer == address(0)) {
            referer = _communityPayables[tldId];
        }
        _balances[referer] += (totalAmount * _referralRewards[tldId]) / 100;

        // Community
        _balances[_communityPayables[tldId]] +=
            (totalAmount * _communityRewards[tldId]) /
            100;

        // Protocol
        _balances[_protocol] += (totalAmount * PROTOCOL_SHARE) / 100;

        // Ecosystem + Users
        uint8 ecosystem = 100 -
            _communityRewards[tldId] -
            _referralRewards[tldId] -
            PROTOCOL_SHARE;
        uint256 usersEcosystemAmount = (totalAmount * ecosystem) / 100 / 2;

        _rewardPerToken += usersEcosystemAmount / _registry.totalSupply();
    }

    function withdraw(uint256[] calldata tokenIds) external {
        _withdraw(msg.sender, tokenIds);
    }

    function withdrawForCommunity(
        uint256 tldId,
        uint256[] calldata tokenIds
    ) external {
        _withdraw(_communityPayables[tldId], tokenIds);
    }

    function _withdraw(address account, uint256[] calldata tokenIds) internal {
        require(account != address(0));
        uint256 amount = balanceOf(account);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            amount += _processTokenReward(account, tokenIds[i]);
        }
        require(amount > 0);
        _balances[account] = 0;
        payable(account).transfer(amount);
    }

    function _processTokenReward(
        address account,
        uint256 tokenId
    ) internal returns (uint256) {
        require(_registry.ownerOf(tokenId) == account);
        uint256 amount = balanceOf(tokenId);
        if (amount > 0) {
            _withdrawPerToken[tokenId] += amount;
        }
        return amount;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function balanceOf(uint256 tokenId) public view returns (uint256) {
        return _rewardPerToken - _withdrawPerToken[tokenId];
    }

    // Function to receive Ether
    receive() external payable {}
}
