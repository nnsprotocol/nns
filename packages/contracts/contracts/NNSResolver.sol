// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IResolver.sol";
import "./interfaces/IRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NNSResolver is IResolver, Ownable {
    mapping(uint256 => IRegistry) _clds;
    uint256 _fallbackCldId;

    mapping(address => uint256) _defaultCldIds;

    constructor() Ownable(msg.sender) {}

    function registerCld(
        IRegistry registry,
        bool isFallback
    ) external onlyOwner {
        (, uint256 cldId) = registry.cld();
        if (address(_clds[cldId]) != address(0)) {
            revert CldAlreadyRegistered();
        }

        _clds[cldId] = registry;
        emit CldRegistered(cldId, address(registry));

        if (isFallback) {
            setFallbackCld(cldId);
        }
    }

    function setFallbackCld(uint256 cldId) public onlyOwner {
        _requireRegistryOf(cldId);
        if (_fallbackCldId == cldId) {
            return;
        }
        _fallbackCldId = cldId;
        emit FallbackCldChanged(cldId);
    }

    function fallbackCld() external view returns (uint256) {
        return _fallbackCldId;
    }

    function setDefaultCld(address account, uint256 cldId) external {
        IRegistry reg = _requireRegistryOf(cldId);
        if (
            msg.sender != account && !reg.isApprovedForAll(account, msg.sender)
        ) {
            revert UnauthorizedAccount();
        }
        _defaultCldIds[account] = cldId;
        emit DefaultCldChanged(account, cldId);
    }

    function reverseNameOf(address addr) public view returns (string memory) {
        return reverseNameOf(addr, _defaultCldOf(addr));
    }

    function reverseNameOf(
        address addr,
        uint256 cldId
    ) public view returns (string memory) {
        return _requireRegistryOf(cldId).reverseNameOf(addr);
    }

    function reverseOf(
        address addr
    ) external view returns (uint256 cldId, uint256 tokenId) {
        cldId = _defaultCldOf(addr);
        return (cldId, _requireRegistryOf(cldId).reverseOf(addr));
    }

    function reverseOf(
        address addr,
        uint256 cldId
    ) external view returns (uint256 tokenId) {
        return _requireRegistryOf(cldId).reverseOf(addr);
    }

    function _requireRegistryOf(
        uint256 cldId
    ) internal view returns (IRegistry) {
        IRegistry registry = _clds[cldId];
        if (address(registry) == address(0)) {
            revert IResolver.InvalidCld();
        }
        return registry;
    }

    function _defaultCldOf(address addr) internal view returns (uint256) {
        uint256 cldId = _defaultCldIds[addr];
        if (cldId == 0) {
            cldId = _fallbackCldId;
        }
        return cldId;
    }
}
