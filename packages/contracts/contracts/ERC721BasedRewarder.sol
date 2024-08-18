// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IERC721Reward.sol";
import "./interfaces/IERC721BasedRewarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721BasedRewarder is Ownable, IERC721BasedRewarder {
    IERC721Rewardable internal _nft;
    Snapshot internal _snapshot;
    mapping(uint256 block => mapping(uint256 tokenId => bool))
        internal _claimedTokens;

    uint256 internal _minSnapshotInterval;
    uint256 internal _balance;

    constructor(
        IERC721Rewardable nft,
        uint256 minSnapshotInterval
    ) Ownable(_msgSender()) {
        _nft = nft;
        _minSnapshotInterval = minSnapshotInterval;
    }

    function erc721() external view returns (address) {
        return address(_nft);
    }

    function incrementBalance(
        uint256 amount
    ) external onlyOwner returns (uint256 newBalance) {
        uint256 oldBalance = _balance;
        _balance += amount;
        emit BalanceChanged(oldBalance, _balance);
        return _balance;
    }

    function balance() external view returns (uint256) {
        return _balance;
    }

    function takeSnapshot() external {
        if (_snapshot.blockTimestamp + _minSnapshotInterval > block.timestamp) {
            revert SnapshotTooEarly(
                _snapshot.blockTimestamp,
                _snapshot.blockTimestamp + _minSnapshotInterval
            );
        }

        uint256 oldBalance = _balance;
        (_snapshot, _balance) = previewSnapshot();
        emit SnapshotCreated(_snapshot);
        emit BalanceChanged(oldBalance, _balance);
    }

    function previewSnapshot()
        public
        view
        returns (Snapshot memory snapshot, uint256 reminder)
    {
        uint256 available = _balance + _snapshot.unclaimed;
        uint256 supply = _nft.totalSupply();
        uint256 reward = available / supply;
        reminder = available % supply;
        snapshot = Snapshot(
            reward,
            supply,
            available - reminder,
            block.number,
            block.timestamp
        );
    }

    function lastSnapshot() external view returns (Snapshot memory) {
        return _snapshot;
    }

    function issueReward(
        address account,
        uint256 tokenId
    ) external onlyOwner returns (uint256) {
        if (_nft.ownerOf(tokenId) != account) {
            revert ERC721NotOwned(account, address(_nft), tokenId);
        }
        if (_claimedTokens[_snapshot.blockNumber][tokenId]) {
            revert ERC721AlreadyClaimed(account, address(_nft), tokenId);
        }
        uint256 mintBlock = _nft.mintBlockNumberOf(tokenId);
        if (mintBlock >= _snapshot.blockNumber) {
            revert ERC721NotInSnapshot(
                account,
                address(_nft),
                tokenId,
                mintBlock,
                _snapshot.blockNumber
            );
        }
        _snapshot.unclaimed -= _snapshot.reward;
        _claimedTokens[_snapshot.blockNumber][tokenId] = true;
        emit RewardClaimed(account, address(_nft), tokenId, _snapshot.reward);
        return _snapshot.reward;
    }

    function balanceOf(uint256 tokenId) public view returns (uint256) {
        uint256 tokenBlock = _nft.mintBlockNumberOf(tokenId);
        if (tokenBlock == 0 || tokenBlock > _snapshot.blockNumber) {
            return 0;
        }
        if (_claimedTokens[_snapshot.blockNumber][tokenId]) {
            return 0;
        }
        return _snapshot.reward;
    }
}
