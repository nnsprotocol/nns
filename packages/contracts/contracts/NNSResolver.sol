// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IResolver.sol";
import "./interfaces/IRegistry.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NNSResolver is IResolver, OwnableUpgradeable {
    mapping(uint256 => IRegistry) _clds;
    uint256 _fallbackCldId;
    mapping(address => uint256) _defaultCldIds;

    uint256[50] __gap;

    function initialize() public initializer {
        __Ownable_init(_msgSender());
    }

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
            _msgSender() != account &&
            !reg.isApprovedForAll(account, _msgSender())
        ) {
            revert UnauthorizedAccount();
        }
        _defaultCldIds[account] = cldId;
        emit DefaultCldChanged(account, cldId);
    }

    function reverseNameOf(address addr) public view returns (string memory) {
        return _requireRegistryOf(defaultCldOf(addr)).reverseNameOf(addr);
    }

    function reverseNameOf(
        address addr,
        uint256[] calldata cldIds,
        bool fallbackToDefault
    ) public view returns (string memory) {
        for (uint256 i = 0; i < cldIds.length; i++) {
            IRegistry reg = _requireRegistryOf(cldIds[i]);
            string memory name = reg.reverseNameOf(addr);
            if (bytes(name).length != 0) {
                return name;
            }
        }
        if (fallbackToDefault) {
            return reverseNameOf(addr);
        }
        return "";
    }

    function reverseOf(
        address addr
    ) public view returns (uint256 cldId, uint256 tokenId) {
        cldId = defaultCldOf(addr);
        return (cldId, _requireRegistryOf(cldId).reverseOf(addr));
    }

    function reverseOf(
        address addr,
        uint256[] calldata cldIds,
        bool fallbackToDefault
    ) external view returns (uint256 cldId, uint256 tokenId) {
        for (uint256 i = 0; i < cldIds.length; i++) {
            IRegistry reg = _requireRegistryOf(cldIds[i]);
            tokenId = reg.reverseOf(addr);
            if (tokenId != 0) {
                return (cldIds[i], tokenId);
            }
        }
        if (fallbackToDefault) {
            return reverseOf(addr);
        }
        return (0, 0);
    }

    function recordOf(
        uint256 cldId,
        uint256 tokenId,
        uint256 key
    ) external view returns (string memory) {
        return _requireRegistryOf(cldId).recordOf(tokenId, key);
    }

    function recordsOf(
        uint256 cldId,
        uint256 tokenId,
        uint256[] calldata keys
    ) external view returns (string[] memory values) {
        return _requireRegistryOf(cldId).recordsOf(tokenId, keys);
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

    function defaultCldOf(address addr) public view returns (uint256) {
        uint256 cldId = _defaultCldIds[addr];
        if (cldId == 0) {
            cldId = _fallbackCldId;
        }
        return cldId;
    }
}
