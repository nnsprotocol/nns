// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IAccountRewarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AccountRewarder is Ownable, IAccountRewarder {
    mapping(address => uint256) internal _balances;

    constructor() Ownable(_msgSender()) {}

    function incrementBalanceOf(
        address account,
        uint256 amount
    ) external override onlyOwner returns (uint256 newBalance) {
        uint256 oldBalance = _balances[account];
        _balances[account] += amount;
        emit BalanceChanged(account, oldBalance, _balances[account]);
        return _balances[account];
    }

    function issueReward(
        address account
    ) external override onlyOwner returns (uint256) {
        uint256 balance = _balances[account];
        _balances[account] = 0;
        emit RewardClaimed(account, balance);
        return balance;
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return _balances[account];
    }
}
