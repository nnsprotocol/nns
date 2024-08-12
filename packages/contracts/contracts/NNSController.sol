// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./CldRegistry.sol";
import "./interfaces/IPricingOracle.sol";
import "./interfaces/IRewarder.sol";
import "./interfaces/IResolver.sol";
import "./interfaces/IController.sol";
import "./interfaces/ICldFactory.sol";
import "./libraries/Namehash.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NNSController is IController, Ownable {
    // namehash("crypto.ETH.address")
    uint256 public constant RECORD_CRYPTO_ETH_ADDRESS =
        0x391a42857851a55da4050881bd0d2e6c9978bfa7483b787e07a760028ed71a2b;

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
    ) Ownable(_msgSender()) {
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
        bool isDefaultCldResolver
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
            communityReward
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
        _validateLabels(labels);
        uint256 cldId = _namehash(0, labels[1]);
        IRegistry registry = _requireRegistryOf(cldId);
        uint256 price = _processRegistrationCost(cldId, periods, labels[0]);

        uint256[] memory recordKeys = new uint256[](1);
        string[] memory recordValues = new string[](1);
        recordKeys[0] = RECORD_CRYPTO_ETH_ADDRESS;
        recordValues[0] = Strings.toHexString(to);

        registry.register(
            to,
            labels[0],
            recordKeys,
            recordValues,
            _getDuration(cldId, periods),
            withReverse
        );

        _rewarder.collect{value: price}(cldId, referer);
    }

    function _validateLabels(string[] calldata labels) internal pure {
        if (labels.length != 2) {
            revert InvalidLabel();
        }
        if (bytes(labels[0]).length == 0) {
            revert InvalidLabel();
        }
    }

    function _getDuration(
        uint256 cldId,
        uint8 periods
    ) internal view returns (uint256) {
        if (_expiringClds[cldId]) {
            return (365 days) * periods;
        }
        return 0;
    }

    function _processRegistrationCost(
        uint256 cldId,
        uint8 periods,
        string calldata name
    ) internal returns (uint256) {
        uint256 price = _pricingOracles[cldId].price(name);
        if (_expiringClds[cldId]) {
            if (periods <= 0) {
                revert InvalidRegistrationPeriod();
            }
            price *= periods;
        }
        if (msg.value < price) {
            revert InsufficientTransferAmount(price, msg.value);
        }
        if (msg.value >= price) {
            payable(_msgSender()).transfer(msg.value - price);
        }
        return price;
    }

    function _namehash(
        uint256 tokenId,
        string memory label
    ) internal pure returns (uint256) {
        if (bytes(label).length == 0) {
            revert InvalidLabel();
        }
        return Namehash.namehash(label, tokenId);
    }

    function setPricingOracle(uint256 cldId, IPricingOracle oracle) public {
        IRegistry registry = _requireRegistryOf(cldId);
        if (!registry.hasCommunityRole(_msgSender())) {
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

    function isExpiringCLD(uint256 cldId) external view returns (bool) {
        _requireRegistryOf(cldId);
        return _expiringClds[cldId];
    }

    function pricingOracleOf(
        uint256 cldId
    ) external view returns (IPricingOracle) {
        _requireRegistryOf(cldId);
        return _pricingOracles[cldId];
    }
}
