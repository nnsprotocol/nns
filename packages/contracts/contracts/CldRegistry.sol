// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRegistry.sol";
import "./interfaces/IRecordStorage.sol";

contract CldRegistry is IRegistry, ERC721, AccessControl {
    string public constant NAME = "NNS: CLDRegistry";
    string public constant VERSION = "0.0.1";

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMMUNITY_ROLE = keccak256("COMMUNITY_ROLE");

    mapping(uint256 tokenId => string) internal _tokenNames;
    mapping(address tokenId => uint256) internal _reverses;
    mapping(uint256 tokenId => uint256) internal _expiries;
    mapping(uint256 tokenId => uint256) internal _mintBlockNumbers;

    mapping(uint256 tokenId => uint256) internal _recordPresets;
    mapping(uint256 recordPresetId => mapping(uint256 key => string))
        internal _records;

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
        if (!isApprovedOrOwner(_msgSender(), tokenId)) {
            revert ERC721InsufficientApproval(_msgSender(), tokenId);
        }
        _;
    }

    function cld() external view returns (string memory name, uint256 id) {
        return (_cldName, _cldId);
    }

    function nameOf(uint256 tokenId) public view returns (string memory) {
        _requireNotExpired(tokenId);
        _requireOwned(tokenId);
        return string.concat(_tokenNames[tokenId], ".", _cldName);
    }

    function reverseOf(address addr) public view returns (uint256 tokenId) {
        tokenId = _reverses[addr];
        if (isExpired(tokenId)) {
            return 0;
        }
        return tokenId;
    }

    function reverseNameOf(address addr) public view returns (string memory) {
        uint256 tokenId = reverseOf(addr);
        if (tokenId == 0) {
            return "";
        }
        return nameOf(reverseOf(addr));
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function register(
        address to,
        string calldata name,
        uint256[] calldata recordKeys,
        string[] calldata recordValues,
        uint256 duration,
        bool withReverse
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _namehash(_cldId, name);
        if (isExpired(tokenId)) {
            _burn(tokenId);
        }
        _mint(to, tokenId, name, duration, withReverse);
        _setRecords(tokenId, recordKeys, recordValues);
        return tokenId;
    }

    function renew(
        uint256 tokenId,
        uint256 duration
    ) external onlyRole(MINTER_ROLE) {
        _requireOwned(tokenId);

        uint256 expiry = expiryOf(tokenId);
        if (expiry == 0) {
            revert NonExpiringToken(tokenId);
        }
        uint256 start = block.timestamp;
        if (expiry > start) {
            start = expiry;
        }
        uint256 newExpiry = start + duration;
        _setExpiry(tokenId, newExpiry);
        emit NameRenewed(_cldId, tokenId, newExpiry);
    }

    function setReverse(uint256 tokenId) external onlyApprovedOrOwner(tokenId) {
        _setReverse(_msgSender(), tokenId);
    }

    function deleteReverse(address addr) external {
        if (msg.sender != addr && !isApprovedForAll(addr, msg.sender)) {
            revert ERC721InsufficientApproval(addr, 0);
        }
        if (reverseOf(addr) == 0) {
            revert NoReverseSet(addr);
        }
        _deleteReverse(addr);
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
        uint256 expiry = 0;
        if (duration > 0) {
            expiry = block.timestamp + duration;
            _setExpiry(tokenId, expiry);
        }
        emit NameRegistered(_cldId, tokenId, name, to, expiry);

        if (withReverse) {
            _setReverse(to, tokenId);
        }
    }

    function _setReverse(address addr, uint256 tokenId) internal {
        _requireOwned(tokenId);
        uint256 oldTokenId = _reverses[addr];
        _reverses[addr] = tokenId;
        emit ReverseChanged(_cldId, addr, oldTokenId, tokenId);
    }

    function _deleteReverse(address addr) internal {
        uint256 oldTokenId = _reverses[addr];
        delete _reverses[addr];
        emit ReverseChanged(_cldId, addr, oldTokenId, 0);
    }

    function _namehash(
        uint256 tokenId,
        string memory label
    ) internal pure returns (uint256) {
        if (bytes(label).length == 0) {
            revert InvalidName(label);
        }
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

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireNotExpired(tokenId);
        return super.tokenURI(tokenId);
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

    function expiryOf(uint256 tokenId) public view returns (uint256) {
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
        _requireNotExpired(tokenId);
        owner = super.ownerOf(tokenId);
    }

    function _requireNotExpired(uint256 tokenId) internal view {
        if (isExpired(tokenId)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    function approve(
        address to,
        uint256 tokenId
    ) public virtual override(ERC721, IERC721) {
        _requireNotExpired(tokenId);
        super.approve(to, tokenId);
    }

    function getApproved(
        uint256 tokenId
    ) public view virtual override(ERC721, IERC721) returns (address) {
        _requireNotExpired(tokenId);
        return super.getApproved(tokenId);
    }

    function _checkAuthorized(
        address owner,
        address spender,
        uint256 tokenId
    ) internal view virtual override {
        _requireNotExpired(tokenId);
        super._checkAuthorized(owner, spender, tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address prevOwner = super._update(to, tokenId, auth);

        // Mint
        if (prevOwner == address(0)) {
            _totalSupply++;
            _mintBlockNumbers[tokenId] = block.number;
        }

        // Burn
        if (to == address(0)) {
            _totalSupply--;
            delete _tokenNames[tokenId];
            delete _mintBlockNumbers[tokenId];
        }

        // Transfer
        if (prevOwner != address(0)) {
            _resetRecords(tokenId);
            if (_reverses[prevOwner] == tokenId) {
                _deleteReverse(prevOwner);
            }
        }

        return prevOwner;
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

    function recordOf(
        uint256 tokenId,
        uint256 keyHash
    ) public view returns (string memory value) {
        if (isExpired(tokenId)) {
            return "";
        }
        return _records[_presetOf(tokenId)][keyHash];
    }

    function recordsOf(
        uint256 tokenId,
        uint256[] calldata keyHashes
    ) external view returns (string[] memory values) {
        values = new string[](keyHashes.length);
        for (uint256 i = 0; i < keyHashes.length; i++) {
            values[i] = recordOf(tokenId, keyHashes[i]);
        }
        return values;
    }

    function setRecord(
        uint256 tokenId,
        uint256 keyHash,
        string calldata value
    ) external onlyApprovedOrOwner(tokenId) {
        _setRecord(tokenId, keyHash, value);
    }

    function setRecords(
        uint256 tokenId,
        uint256[] calldata keyHashes,
        string[] calldata values
    ) external onlyApprovedOrOwner(tokenId) {
        _setRecords(tokenId, keyHashes, values);
    }

    function resetRecords(
        uint256 tokenId
    ) external onlyApprovedOrOwner(tokenId) {
        _resetRecords(tokenId);
    }

    function _setRecord(
        uint256 tokenId,
        uint256 keyHash,
        string calldata value
    ) internal {
        _requireOwned(tokenId);
        _requireNotExpired(tokenId);
        _records[_presetOf(tokenId)][keyHash] = value;
        emit RecordSet(_cldId, tokenId, keyHash, value);
    }

    function _setRecords(
        uint256 tokenId,
        uint256[] calldata keyHashes,
        string[] calldata values
    ) internal {
        require(keyHashes.length == values.length);
        for (uint256 i = 0; i < keyHashes.length; i++) {
            _setRecord(tokenId, keyHashes[i], values[i]);
        }
    }

    function _resetRecords(uint256 tokenId) internal {
        _recordPresets[tokenId] = uint256(
            keccak256(abi.encodePacked(_presetOf(tokenId)))
        );
        emit RecordsReset(_cldId, tokenId);
    }

    function _presetOf(
        uint256 tokenId
    ) internal view virtual returns (uint256) {
        return _recordPresets[tokenId] == 0 ? tokenId : _recordPresets[tokenId];
    }

    function mintBlockNumberOf(
        uint256 tokenId
    ) external view returns (uint256) {
        _requireOwned(tokenId);
        _requireNotExpired(tokenId);
        return _mintBlockNumbers[tokenId];
    }
}
