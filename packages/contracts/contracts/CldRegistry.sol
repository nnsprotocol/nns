// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRegistry.sol";

contract CldRegistry is IRegistry, ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMMUNITY_ROLE = keccak256("COMMUNITY_ROLE");

    mapping(uint256 => string) internal _tokenNames;
    mapping(address => uint256) internal _reverses;
    // Mapping of tokenId to expiry timestamp
    mapping(uint256 => uint256) internal _expiries;

    uint256 _totalSupply;

    uint256 internal _cldId;
    string internal _cldName;

    constructor(
        string memory cldName,
        string memory symbol,
        address minter,
        address communityManager
    ) ERC721(cldName, symbol) {
        _cldId = _namehash(0, cldName);
        _cldName = cldName;

        _grantRole(MINTER_ROLE, minter);
        _grantRole(COMMUNITY_ROLE, communityManager);
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        require(
            isApprovedOrOwner(_msgSender(), tokenId),
            "Registry: SENDER_IS_NOT_APPROVED_OR_OWNER"
        );
        _;
    }

    function cld() external view returns (string memory name, uint256 id) {
        return (_cldName, _cldId);
    }

    function nameOf(uint256 tokenId) public view returns (string memory) {
        string memory name = _tokenNames[tokenId];
        if (bytes(name).length == 0) {
            return "";
        }
        return string.concat(name, ".", _cldName);
    }

    function reverseOf(address addr) public view returns (uint256 tokenId) {
        return _reverses[addr];
    }

    function reverseNameOf(address addr) public view returns (string memory) {
        return nameOf(reverseOf(addr));
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function mintOrUnlock(
        address to,
        string calldata name,
        bool withReverse
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _namehash(0, name);
        if (_ownerOf(tokenId) == address(0)) {
            _mint(to, tokenId, name, withReverse);
        } else if (isExpired(tokenId)) {
            _unlock(to, tokenId, withReverse);
        } else {
            revert("exists and not expired");
        }
        return tokenId;
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
        _safeMint(to, tokenId);
        _tokenNames[tokenId] = name;
        _totalSupply++;

        if (withReverse) {
            _setReverse(to, tokenId);
        }
    }

    function _unlock(address to, uint256 tokenId, bool withReverse) internal {
        require(isExpired(tokenId));
        _transfer(_ownerOf(tokenId), to, tokenId);
        if (withReverse) {
            _setReverse(to, tokenId);
        }
    }

    function _setReverse(address addr, uint256 tokenId) internal {
        _requireOwned(tokenId);
        _reverses[addr] = tokenId;
    }

    function namehash(
        string calldata name
    ) external pure returns (uint256 hash) {
        return _namehash(0, name);
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

    function isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) public view returns (bool) {
        address owner = ownerOf(tokenId);

        if (owner == address(0)) {
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

    function hasCommunityRole(address account) external view returns (bool) {
        return hasRole(COMMUNITY_ROLE, account);
    }

    function transferCommunityRole(
        address newAccount
    ) external onlyRole(COMMUNITY_ROLE) {
        _grantRole(COMMUNITY_ROLE, newAccount);
        _revokeRole(COMMUNITY_ROLE, msg.sender);
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

    function expiryOf(uint256 tokenId) external view returns (uint256) {
        return _expiries[tokenId];
    }

    function isExpired(uint256 tokenId) public view returns (bool) {
        return _expiries[tokenId] != 0 && _expiries[tokenId] < block.timestamp;
    }

    function setExpiry(
        uint256 tokenId,
        uint256 expiry
    ) external onlyRole(MINTER_ROLE) {
        _requireOwned(tokenId);
        require(expiry > block.timestamp, "Registry: EXPIRY_IN_PAST");

        _expiries[tokenId] = expiry;
    }

    function ownerOf(
        uint256 tokenId
    ) public view virtual override(IERC721, ERC721) returns (address owner) {
        if (!isExpired(tokenId)) {
            owner = super.ownerOf(tokenId);
        }
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        if (isExpired(tokenId)) {
            return address(0);
        }
        address prevOwner = super._update(to, tokenId, auth);
        _reset(prevOwner, tokenId);
        return prevOwner;
    }

    function _reset(address owner, uint256 tokenId) internal {
        if (_reverses[owner] == tokenId) {
            delete _reverses[owner];
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, IERC165, AccessControl)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
