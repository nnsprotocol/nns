// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/*
X register a TLD
X register a domain
X reverse lookup
X owner's permissions
X change reverse
*/

contract NNSRegistry is ERC721 {
    address internal _mintingManager;
    mapping(uint256 => string) internal _tokenNames;
    mapping(address => uint256) internal _reverses;

    event NewDomain(uint256 tokenId, string name);
    event SetReverse(address owner, uint256 tokenId);

    constructor() ERC721("NNS", "NNS") {
        _mintingManager = _msgSender();
    }

    modifier onlyMintingManager() {
        require(
            _msgSender() == _mintingManager,
            "Registry: SENDER_IS_NOT_MINTING_MANAGER"
        );
        _;
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Registry: SENDER_IS_NOT_APPROVED_OR_OWNER"
        );
        _;
    }

    function nameOf(uint256 tokenId) public view returns (string memory) {
        return _tokenNames[tokenId];
    }

    function reverseOf(address addr) public view returns (uint256 tokenId) {
        return _reverses[addr];
    }

    function reverseNameOf(address addr) public view returns (string memory) {
        return nameOf(reverseOf(addr));
    }

    function mintTLD(string memory name) external onlyMintingManager {
        _mint(_mintingManager, _namehash(0, name), name, false);
    }

    function mint(
        address to,
        string[] calldata labels,
        bool withReverse
    ) external onlyMintingManager {
        (uint256 tokenId, uint256 parentTokenId) = _namehash(labels);
        _requireOwned(parentTokenId);
        _mint(to, tokenId, _uri(labels), withReverse);
    }

    function setReverse(
        address addr,
        uint256 tokenId
    ) external onlyApprovedOrOwner(tokenId) {
        _setReverse(addr, tokenId);
    }

    function _mint(
        address to,
        uint256 tokenId,
        string memory name,
        bool withReverse
    ) internal {
        _mint(to, tokenId);
        _tokenNames[tokenId] = name;
        emit NewDomain(tokenId, name);

        if (withReverse) {
            _setReverse(to, tokenId);
        }
    }

    function _setReverse(address addr, uint256 tokenId) internal {
        _requireOwned(tokenId);
        _reverses[addr] = tokenId;
        emit SetReverse(addr, tokenId);
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
        require(bytes(label).length != 0, "Registry: LABEL_EMPTY");
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

    function _uri(string[] memory labels) private pure returns (string memory) {
        bytes memory uri = bytes(labels[0]);
        for (uint256 i = 1; i < labels.length; i++) {
            uri = abi.encodePacked(uri, ".", labels[i]);
        }
        return string(uri);
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);

        if (owner == address(0)) {
            // token expired.
            return false;
        }
        if (spender == owner) {
            return true;
        }
        if (isApprovedForAll(owner, spender)) {
            return true;
        }
        if (getApproved(tokenId) == spender) {
            return true;
        }
        return false;
    }
}
