// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";

interface IResolver {
    event CldRegistered(uint256 cldId, address registry);
    event DefaultCldChanged(address account, uint256 cldId);
    event FallbackCldChanged(uint256 cldId);

    error CldAlreadyRegistered();
    error UnauthorizedAccount();
    error InvalidCld();

    function reverseNameOf(address addr) external view returns (string memory);

    function reverseNameOf(
        address addr,
        uint256 cldId
    ) external view returns (string memory);

    function reverseOf(
        address addr
    ) external view returns (uint256 cldId, uint256 tokenId);

    function reverseOf(
        address addr,
        uint256 cldId
    ) external view returns (uint256 tokenId);

    function recordOf(uint256 cldId, uint256 tokenId, uint256 key) external returns (string memory);

    function registerCld(IRegistry registry, bool isFallback) external;

    function setDefaultCld(address account, uint256 cldId) external;

    function setFallbackCld(uint256 cldId) external;

    function fallbackCld() external view returns (uint256);
}
