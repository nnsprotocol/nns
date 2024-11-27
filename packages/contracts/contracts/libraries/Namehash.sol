//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library Namehash {
    function namehash(
        string memory self,
        uint256 parent
    ) internal pure returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(parent, keccak256(abi.encodePacked(self)))
                )
            );
    }
}
