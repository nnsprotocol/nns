// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IRecordReader {
    function recordOf(
        uint256 tokenId,
        uint256 keyHash
    ) external view returns (string memory value);

    function recordsOf(
        uint256 tokenId,
        uint256[] calldata keyHashes
    ) external view returns (string[] memory values);
}

interface IRecordStorage is IRecordReader {
    event RecordsReset(uint256 cldId, uint256 tokenId);
    event RecordSet(
        uint256 cldId,
        uint256 tokenId,
        uint256 keyHash,
        string value
    );

    function setRecord(
        uint256 tokenId,
        uint256 keyHash,
        string calldata value
    ) external;

    function setRecords(
        uint256 tokenId,
        uint256[] calldata keyHashes,
        string[] calldata values
    ) external;

    function resetRecords(uint256 tokenId) external;
}
