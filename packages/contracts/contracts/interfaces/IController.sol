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
    event CldSignatureRequiredChanged(uint256 cldId, bool required);

    error InvalidPricingOracle();
    error CldAlreadyExists();
    error UnauthorizedAccount();
    error InvalidCld();
    error InvalidLabel();
    error InsufficientTransferAmount(uint256 required, uint256 provided);
    error InvalidRegistrationPeriod();
    error NonExpiringCld(uint256 cldId);
    error InvalidRegistrationMethod();

    function registryOf(uint256 cldId) external view returns (IRegistry);

    function registerCld(
        string memory name,
        uint8 communityReward,
        uint8 referralReward,
        IPricingOracle pricingOracle,
        address communityPayable,
        address communityManager,
        bool hasExpiringNames,
        bool isDefaultCldResolver
    ) external;

    function register(
        address to,
        string[] calldata labels,
        bool withReverse,
        address referer,
        uint8 periods
    ) external payable;

    function registerWithSignature(
        address to,
        string[] calldata labels,
        bool withReverse,
        address referer,
        uint8 periods,
        uint256 nonce,
        uint256 expiry,
        bytes memory signature
    ) external payable;

    function renew(string[] calldata labels, uint8 periods) external payable;

    function setPricingOracle(uint256 cldId, IPricingOracle oracle) external;

    function pricingOracleOf(
        uint256 cldId
    ) external view returns (IPricingOracle);

    function isExpiringCLD(uint256 cldId) external view returns (bool);

    function setCldSignatureRequired(
        uint256 cldId,
        bool requiresSignature
    ) external;

    function isSignatureRequired(uint256 cldId) external view returns (bool);

    function updateSigner(address signer) external;

    function signer() external view returns (address);
}
