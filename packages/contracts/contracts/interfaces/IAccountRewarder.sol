// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IAccountRewarder {
    event RewardClaimed(address account, uint256 reward);
    event BalanceChanged(
        address account,
        uint256 oldBalance,
        uint256 newBalance
    );

    function incrementBalanceOf(
        address account,
        uint256 amount
    ) external returns (uint256 newBalance);

    function issueReward(address account) external returns (uint256);

    function balanceOf(address account) external view returns (uint256);
}
