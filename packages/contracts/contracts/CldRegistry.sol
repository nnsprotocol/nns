// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRegistry.sol";

contract CldRegistry is IRegistry, ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMMUNITY_ROLE = keccak256("COMMUNITY_ROLE");

    mapping(uint256 tokenId => string) internal _tokenNames;
    mapping(address tokenId => uint256) internal _reverses;
    mapping(uint256 tokenId => uint256) internal _expiries;

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

    function register(
        address to,
        string calldata name,
        uint256 duration,
        bool withReverse
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _namehash(0, name);
        if (isExpired(tokenId)) {
            _burn(tokenId);
            _totalSupply--;
        }
        _mint(to, tokenId, name, duration, withReverse);
        return tokenId;
    }

    function renew(uint256 duration) external returns (uint256 tokenId) {
        revert("not implemented");
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
        uint256 duration,
        bool withReverse
    ) internal {
        _safeMint(to, tokenId);
        _tokenNames[tokenId] = name;
        _totalSupply++;
        uint256 expiry = 0;
        if (duration > 0) {
            expiry = block.timestamp + duration;
            _setExpiry(tokenId, expiry);
        }
        emit NameRegistered(tokenId, name, to, expiry);

        if (withReverse) {
            _setReverse(to, tokenId);
        }
    }

    function _setReverse(address addr, uint256 tokenId) internal {
        _requireOwned(tokenId);
        _reverses[addr] = tokenId;
        emit ReverseNameChanged(addr, tokenId);
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

    function _setExpiry(uint256 tokenId, uint256 expiry) internal {
        _expiries[tokenId] = expiry;
    }

    function ownerOf(
        uint256 tokenId
    ) public view virtual override(IERC721, ERC721) returns (address owner) {
        if (!isExpired(tokenId)) {
            owner = super.ownerOf(tokenId);
        }
    }

    // function _update(
    //     address to,
    //     uint256 tokenId,
    //     address auth
    // ) internal virtual override returns (address) {
    //     if (isExpired(tokenId)) {
    //         return address(0);
    //     }
    //     address prevOwner = super._update(to, tokenId, auth);
    //     _reset(prevOwner, tokenId);
    //     return prevOwner;
    // }

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
