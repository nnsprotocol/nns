// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./interfaces/IRegistry.sol";
import "./interfaces/IPricingOracle.sol";
import "./interfaces/IRewarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
- mint a TLD
- mint a name
*/

contract NNSRegistrationController is Ownable {
    IRegistry _registry;
    IRewarder _rewarder;

    mapping(uint256 => uint8) _communityRewards;
    mapping(uint256 => address) _communityPayables;
    mapping(uint256 => uint8) _referralRewards;
    mapping(uint256 => IPricingOracle) _pricingOracles;

    constructor() Ownable(msg.sender) {}

    function registerTLD(
        string memory name,
        uint8 communityReward,
        uint8 referralReward,
        IPricingOracle pricingOracle,
        address communityPayable
    ) external onlyOwner {
        // require(
        //     PROTOCOL_FEE + communityReward + ecosystemReward + referralReward ==
        //         100
        // );
        require(address(pricingOracle) != address(0));
        uint256 tokenId = _registry.mintTLD(name);

        // move all this to the the rewarder.
        _communityRewards[tokenId] = communityReward;
        _referralRewards[tokenId] = referralReward;
        _communityPayables[tokenId] = communityPayable;

        _pricingOracles[tokenId] = pricingOracle;
    }

    function registerDomain(
        string[] calldata labels,
        bool withReverse,
        address referer
    ) external payable {
        require(labels.length == 2);
        (, uint256 tldId) = _namehash(labels);

        uint256 price = _pricingOracles[tldId].price(labels[0]);
        require(msg.value >= price);

        _registry.mint(msg.sender, labels, withReverse);
        _rewarder.collect{value: msg.value}(tldId, referer);
    }

    function _namehash(
        string[] memory labels
    ) internal pure returns (uint256 tokenId, uint256 parentId) {
        for (uint256 i = labels.length; i > 0; i--) {
            parentId = tokenId;
            tokenId = _namehash(parentId, labels[i - 1]);
        }
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
}
