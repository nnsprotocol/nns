// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IRecordStorage.sol";

interface IRegistry is IERC721, IRecordStorage {
    event ReverseChanged(
        uint256 cldId,
        address account,
        uint256 fromTokenId,
        uint256 toTokenId
    );
    event NameRegistered(
        uint256 cldId,
        uint256 tokenId,
        string name,
        address owner,
        uint256 expiry
    );
    event NameRenewed(uint256 cldId, uint256 tokenId, uint256 expiry);

    error NonExpiringToken(uint256 tokenId);
    error InvalidName(string name);
    error NoReverseSet(address account);

    function totalSupply() external view returns (uint256);

    function cld() external view returns (string memory name, uint256 id);

    function nameOf(uint256 tokenId) external view returns (string memory);

    function reverseOf(address addr) external view returns (uint256 tokenId);

    function reverseNameOf(address addr) external view returns (string memory);

    function setReverse(uint256 tokenId) external;

    function deleteReverse(address addr) external;

    function register(
        address to,
        string calldata name,
        string[] calldata recordKeys,
        string[] calldata recordValues,
        uint256 duration,
        bool withReverse
    ) external returns (uint256 tokenId);

    function renew(uint256 tokenId, uint256 duration) external;

    function isApprovedOrOwner(
        address addr,
        uint256 tokenId
    ) external view returns (bool);

    function hasCommunityRole(address account) external view returns (bool);

    function transferCommunityRole(address newAccount) external;

    function expiryOf(uint256 tokenId) external view returns (uint256);

    function isExpired(uint256 tokenId) external view returns (bool);

    function mintBlockNumberOf(uint256 tokenId) external view returns (uint256);
}
