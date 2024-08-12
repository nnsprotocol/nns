// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IERC721Rewardable {
    function totalSupply() external view returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address);

    function mintBlockNumberOf(uint256 tokenId) external view returns (uint256);
}

interface IERC721RewardSplitter {
    error TokenNotOwned(address account, address erc721, uint256 tokenId);
    error TokenNotInSnapshot(
        address erc721,
        uint256 tokenId,
        uint256 mintBlock,
        uint256 snapshotBlock
    );
    error SnapshotTooEarly();

    event SnapshotCreated(Snapshot);
    event RewardClaimed(
        address account,
        address erc721,
        uint256 tokenId,
        uint256 reward
    );

    struct Snapshot {
        uint256 reward;
        uint256 supply;
        uint256 unclaimed;
        uint256 blockNumber;
        uint256 blockTimestamp;
    }

    function erc721() external view returns (address);

    function takeSnapshot(
        uint256 availableBalance
    ) external returns (uint256 reminder);

    function previewSnapshot(
        uint256 availableBalance
    ) external view returns (Snapshot memory snapshot, uint256 reminder);

    function lastSnapshot() external view returns (Snapshot memory);

    function issueReward(
        address account,
        uint256 tokenId
    ) external returns (uint256);

    function balanceOf(uint256 tokenId) external view returns (uint256);
}
