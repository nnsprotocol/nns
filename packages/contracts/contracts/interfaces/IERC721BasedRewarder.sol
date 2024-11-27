// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IERC721BasedRewarder {
    error ERC721AlreadyClaimed(
        address account,
        address erc721,
        uint256 tokenId
    );
    error ERC721NotOwned(address account, address erc721, uint256 tokenId);
    error ERC721NotInSnapshot(
        address account,
        address erc721,
        uint256 tokenId,
        uint256 mintBlock,
        uint256 snapshotBlock
    );
    error SnapshotTooEarly(uint256 lastTimestamp, uint256 nextTimestamp);

    event SnapshotCreated(Snapshot);

    event BalanceChanged(uint256 oldBalance, uint256 newBalance);

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

    function incrementBalance(
        uint256 amount
    ) external returns (uint256 newBalance);

    function balance() external view returns (uint256);

    function takeSnapshot() external;

    function previewSnapshot()
        external
        view
        returns (Snapshot memory snapshot, uint256 reminder);

    function lastSnapshot() external view returns (Snapshot memory);

    function issueReward(
        address account,
        uint256 tokenId
    ) external returns (uint256);

    function balanceOf(uint256 tokenId) external view returns (uint256);
}
