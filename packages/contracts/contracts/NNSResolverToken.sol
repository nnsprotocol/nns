// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/IERC721Reward.sol";
import "./interfaces/IResolvingToken.sol";
import "./libraries/Namehash.sol";

contract NNSResolverToken is ERC721, IResolvingToken, Ownable {
    mapping(uint256 tokenId => uint256) private _mintBlockNumbers;
    mapping(uint256 tokenId => string) private _names;
    uint256 private _totalSupply;

    constructor() ERC721("NNS Resolver", "NNSR") Ownable(_msgSender()) {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address prevOwner = super._update(to, tokenId, auth);

        // Mint
        if (prevOwner == address(0)) {
            _mintBlockNumbers[tokenId] = block.number;
            _totalSupply++;
        }

        // Burn
        if (to == address(0)) {
            delete _mintBlockNumbers[tokenId];
            delete _names[tokenId];
            _totalSupply--;
        }

        return prevOwner;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function ownerOf(
        uint256 tokenId
    ) public view override(ERC721, IERC721Rewardable) returns (address) {
        return super.ownerOf(tokenId);
    }

    function mintBlockNumberOf(
        uint256 tokenId
    ) external view returns (uint256) {
        _requireOwned(tokenId);
        return _mintBlockNumbers[tokenId];
    }

    function mint(address to, string calldata name) external onlyOwner {
        uint256 tokenId = Namehash.namehash(name, 0);
        _names[tokenId] = name;
        _mint(to, tokenId);
    }

    function burn(string calldata name) external onlyOwner {
        uint256 tokenId = Namehash.namehash(name, 0);
        _burn(tokenId);
    }

    function nameOf(
        uint256 tokenId
    ) external view override returns (string memory) {
        _requireOwned(tokenId);
        return _names[tokenId];
    }

    function _baseURI() internal view override returns (string memory) {
        return
            string.concat(
                "https://metadata.nns.xyz/",
                Strings.toString(block.chainid),
                "/",
                Strings.toHexString(address(this)),
                "/"
            );
    }
}
