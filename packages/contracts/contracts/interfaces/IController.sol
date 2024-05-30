// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IRegistry.sol";
import "./IPricingOracle.sol";

interface IController {
    event CldRegistered(
        uint256 cldId,
        string name,
        address registry,
        bool hasExpiringNames
    );
    event PricingOracleChanged(uint256 cldId, address oracle);

    error InvalidPricingOracle();
    error CldAlreadyExists();
    error UnauthorizedAccount();
    error InvalidCld();
    error InvalidLabel();
    error InsufficientTransferAmount(uint256 required, uint256 provided);
    error InvalidRegistrationPeriod();

    function registryOf(uint256 cldId) external view returns (IRegistry);

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
    ) external;

    function register(
        address to,
        string[] calldata labels,
        bool withReverse,
        address referer,
        uint8 periods
    ) external payable;

    function setPricingOracle(uint256 cldId, IPricingOracle oracle) external;
}
