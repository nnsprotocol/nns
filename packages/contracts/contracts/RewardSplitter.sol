// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRewarder.sol";
import "./interfaces/IERC721Reward.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardSplitter is IERC721RewardSplitter, Ownable {
    IERC721Rewardable internal _nft;

    Snapshot internal _snapshot;
    mapping(uint256 block => mapping(uint256 tokenId => bool))
        internal _claimedTokens;

    uint256 internal _minSnapshotInterval;

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

    function takeSnapshot(
        uint256 availableBalance
    ) external override onlyOwner returns (uint256 reminder) {
        if (_snapshot.blockTimestamp + _minSnapshotInterval > block.timestamp) {
            revert SnapshotTooEarly();
        }

        (_snapshot, reminder) = previewSnapshot(availableBalance);
        emit SnapshotCreated(_snapshot);
    }

    function previewSnapshot(
        uint256 availableBalance
    )
        public
        view
        override
        returns (Snapshot memory snapshot, uint256 reminder)
    {
        uint256 balance = availableBalance + _snapshot.unclaimed;
        uint256 supply = _nft.totalSupply();
        uint256 reward = balance / supply;
        snapshot = Snapshot(
            reward,
            supply,
            balance,
            block.number,
            block.timestamp
        );
        reminder = balance % supply;
    }

    function lastSnapshot() external view override returns (Snapshot memory) {
        return _snapshot;
    }

    function issueReward(
        address account,
        uint256 tokenId
    ) external override onlyOwner returns (uint256) {
        if (_claimedTokens[_snapshot.blockNumber][tokenId]) {
            return 0;
        }
        if (_nft.ownerOf(tokenId) != account) {
            revert TokenNotOwned(account, address(_nft), tokenId);
        }
        uint256 mintBlock = _nft.mintBlockNumberOf(tokenId);
        if (mintBlock >= _snapshot.blockNumber) {
            revert TokenNotInSnapshot(
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

    function balanceOf(
        uint256 tokenId
    ) external view override returns (uint256) {
        uint256 tokenBlock = _nft.mintBlockNumberOf(tokenId);
        if (tokenBlock > _snapshot.blockNumber) {
            return 0;
        }
        if (_claimedTokens[_snapshot.blockNumber][tokenId]) {
            return 0;
        }
        return _snapshot.reward;
    }
}
