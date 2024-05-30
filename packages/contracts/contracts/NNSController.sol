// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./CldRegistry.sol";
import "./interfaces/IPricingOracle.sol";
import "./interfaces/IRewarder.sol";
import "./interfaces/IResolver.sol";
import "./interfaces/IController.sol";
import "./interfaces/ICldFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NNSController is IController, Ownable {
    IResolver _resolver;
    IRewarder _rewarder;
    ICldFactory _cldFactory;

    mapping(uint256 => IRegistry) _registries;
    mapping(uint256 => IPricingOracle) _pricingOracles;
    mapping(uint256 => bool) _expiringClds;

    constructor(
        IRewarder rewarder,
        IResolver resolver,
        ICldFactory cldFactory
    ) Ownable(msg.sender) {
        _rewarder = rewarder;
        _resolver = resolver;
        _cldFactory = cldFactory;
    }

    function registryOf(uint256 cldId) public view returns (IRegistry) {
        return _registries[cldId];
    }

    function registerCld(
        string memory name,
        uint8 communityReward,
        uint8 referralReward,
        IPricingOracle pricingOracle,
        address communityPayable,
        address communityManager,
        bool hasExpiringNames,
        bool isDefaultCldResolver,
        bool isSplitShareCld
    ) external onlyOwner {
        IRegistry reg = _cldFactory.createCld(
            name,
            address(this),
            communityManager
        );
        (, uint256 cldId) = reg.cld();
        if (address(_registries[cldId]) != address(0)) {
            revert CldAlreadyExists();
        }

        _rewarder.registerCld(
            reg,
            communityPayable,
            referralReward,
            communityReward,
            isSplitShareCld
        );
        _resolver.registerCld(reg, isDefaultCldResolver);
        _registries[cldId] = reg;
        if (hasExpiringNames) {
            _expiringClds[cldId] = true;
        }
        emit CldRegistered(cldId, name, address(reg), hasExpiringNames);

        // Done at the end so the event timeline is consistent.
        _setPricingOracle(cldId, pricingOracle);
    }

    function register(
        address to,
        string[] calldata labels,
        bool withReverse,
        address referer,
        uint8 periods
    ) external payable {
        if (labels.length != 2) {
            revert InvalidLabel();
        }
        string memory name = labels[0];
        string memory cld = labels[1];

        uint256 cldId = _namehash(0, cld);
        IRegistry registry = _requireRegistryOf(cldId);
        bool expires = _expiringClds[cldId];

        uint256 price = _pricingOracles[cldId].price(labels[0]);
        if (expires) {
            if (periods <= 0) {
                revert InvalidRegistrationPeriod();
            }
            price *= periods;
        }
        if (msg.value < price) {
            revert InsufficientTransferAmount(price, msg.value);
        }
        if (msg.value >= price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        uint256 tokenId = registry.mintOrUnlock(to, name, withReverse);
        if (expires) {
            registry.setExpiry(tokenId, block.timestamp + (365 days) * periods);
        }
        _rewarder.collect{value: price}(cldId, referer);
    }

    function _namehash(
        uint256 tokenId,
        string memory label
    ) internal pure returns (uint256) {
        require(bytes(label).length != 0, "MintingManager: LABEL_EMPTY");
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        tokenId,
                        keccak256(abi.encodePacked(label))
                    )
                )
            );
    }

    function setPricingOracle(uint256 cldId, IPricingOracle oracle) public {
        IRegistry registry = _requireRegistryOf(cldId);
        if (!registry.hasCommunityRole(msg.sender)) {
            revert UnauthorizedAccount();
        }
        _setPricingOracle(cldId, oracle);
    }

    function _setPricingOracle(uint256 cldId, IPricingOracle oracle) internal {
        if (address(oracle) == address(0)) {
            revert InvalidPricingOracle();
        }

        if (oracle == _pricingOracles[cldId]) {
            return;
        }
        _pricingOracles[cldId] = oracle;
        emit PricingOracleChanged(cldId, address(oracle));
    }

    function _requireRegistryOf(
        uint256 cldId
    ) internal view returns (IRegistry) {
        IRegistry registry = _registries[cldId];
        if (address(registry) == address(0)) {
            revert InvalidCld();
        }
        return registry;
    }
}
