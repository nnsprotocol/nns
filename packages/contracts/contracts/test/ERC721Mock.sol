// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IERC721Reward.sol";

contract ERC721Mock is ERC721, IERC721Rewardable {
    uint256 private _totalSupply;
    mapping(uint256 tokenId => uint256) private _mintBlockNumbers;

    constructor() ERC721("ERC721Mock", "ERM") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
        _mintBlockNumbers[amount] = block.number;
        _totalSupply++;
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
        delete _mintBlockNumbers[tokenId];
        _totalSupply--;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function mintBlockNumberOf(
        uint256 tokenId
    ) external view returns (uint256) {
        return _mintBlockNumbers[tokenId];
    }

    function ownerOf(
        uint256 tokenId
    ) public view override(ERC721, IERC721Rewardable) returns (address) {
        return super.ownerOf(tokenId);
    }
}
