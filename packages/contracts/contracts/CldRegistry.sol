// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRegistry.sol";
import "./interfaces/IRecordStorage.sol";
import "./interfaces/IERC721Reward.sol";
import "./libraries/Namehash.sol";

contract CldRegistry is IRegistry, ERC721, AccessControl, IERC721Rewardable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMMUNITY_ROLE = keccak256("COMMUNITY_ROLE");

    mapping(uint256 tokenId => string) internal _tokenNames;
    mapping(address tokenId => uint256) internal _reverses;
    mapping(uint256 tokenId => uint256) internal _expiries;
    mapping(uint256 tokenId => uint256) internal _mintBlockNumbers;
    mapping(uint256 subdomainId => uint256) internal _subdomainParents;
    mapping(uint256 tokenId => uint256[]) internal _subdomains;

    mapping(uint256 tokenId => uint256) internal _recordPresets;
    mapping(uint256 recordPresetId => mapping(uint256 key => string))
        internal _records;

    uint256 internal _totalSupply;

    uint256 internal _cldId;
    string internal _cldName;

    constructor(
        string memory cldName,
        address minter,
        address communityManager
    ) ERC721(string.concat("NNS .", cldName), string.concat(".", cldName)) {
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
        uint256 domainId = _domainTokenId(tokenId);
        _requireNotExpired(domainId);
        _requireOwned(domainId);
        return string.concat(_tokenNames[tokenId], ".", _cldName);
    }

    function parentOf(uint256 subdomainId) public view returns (uint256) {
        return _subdomainParents[subdomainId];
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

    function totalSupply()
        external
        view
        override(IERC721Rewardable, IRegistry)
        returns (uint256)
    {
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
        string calldata name,
        uint256 duration
    ) external onlyRole(MINTER_ROLE) {
        uint256 tokenId = _namehash(_cldId, name);
        _requireOwned(tokenId);
        _requireNotExpired(tokenId);

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

    function registerSubdomain(
        uint256 tokenId,
        string calldata name
    ) external onlyApprovedOrOwner(tokenId) returns (uint256) {
        uint256 subdomainId = _namehash(tokenId, name);
        if (_subdomainParents[subdomainId] != 0) {
            revert SubdomainAlreadyExists(tokenId, name);
        }

        _subdomains[tokenId].push(subdomainId);
        _subdomainParents[subdomainId] = tokenId;
        _tokenNames[subdomainId] = string.concat(
            name,
            ".",
            _tokenNames[tokenId]
        );
        emit SubdomainRegistered(_cldId, tokenId, name, subdomainId);
        return tokenId;
    }

    function deleteSubdomain(
        uint256 subdomainId
    ) external onlyApprovedOrOwner(_domainTokenId(subdomainId)) {
        uint256 parent = _subdomainParents[subdomainId];
        if (parent == 0) {
            revert NonexistentSubdomain(subdomainId);
        }

        // Remove the subdomain from the parent's list
        for (uint256 i = 0; i < _subdomains[parent].length; i++) {
            if (_subdomains[parent][i] == subdomainId) {
                _subdomains[parent][i] = _subdomains[parent][
                    _subdomains[parent].length - 1
                ];
                _subdomains[parent].pop();
                break;
            }
        }

        delete _subdomainParents[subdomainId];
        delete _tokenNames[subdomainId];
        _resetRecords(subdomainId);

        emit SubdomainDeleted(_cldId, subdomainId);
    }

    function _deleteAllSubdomains(uint256 parentTokenId) internal {
        for (uint256 i = 0; i < _subdomains[parentTokenId].length; i++) {
            uint256 subdomainId = _subdomains[parentTokenId][i];
            delete _subdomainParents[subdomainId];
            delete _tokenNames[subdomainId];
            _resetRecords(subdomainId);
            emit SubdomainDeleted(_cldId, subdomainId);
        }
        delete _subdomains[parentTokenId];
    }

    function subdomainsOf(
        uint256 tokenId
    ) external view returns (uint256[] memory) {
        return _subdomains[tokenId];
    }

    /**
     * @dev Returns the parent tokenId when the given id is a subdomain. Otherwise returns the input.
     */
    function _domainTokenId(
        uint256 tokenOrSubdomainId
    ) internal view returns (uint256) {
        if (_subdomainParents[tokenOrSubdomainId] != 0) {
            return _subdomainParents[tokenOrSubdomainId];
        }
        return tokenOrSubdomainId;
    }

    function setReverse(
        uint256 tokenId,
        uint256[] calldata recordKeys,
        string[] calldata recordValues
    ) external onlyApprovedOrOwner(_domainTokenId(tokenId)) {
        _setReverse(_msgSender(), tokenId);
        _setRecords(tokenId, recordKeys, recordValues);
    }

    function deleteReverse(address addr) external {
        if (_msgSender() != addr && !isApprovedForAll(addr, _msgSender())) {
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
        return Namehash.namehash(label, tokenId);
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
        _revokeRole(COMMUNITY_ROLE, _msgSender());
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
    )
        public
        view
        virtual
        override(ERC721, IERC721, IERC721Rewardable)
        returns (address owner)
    {
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
            _deleteAllSubdomains(tokenId);
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
    ) external onlyApprovedOrOwner(_domainTokenId(tokenId)) {
        _setRecord(tokenId, keyHash, value);
    }

    function setRecords(
        uint256 tokenId,
        uint256[] calldata keyHashes,
        string[] calldata values
    ) external onlyApprovedOrOwner(_domainTokenId(tokenId)) {
        _setRecords(tokenId, keyHashes, values);
    }

    function resetRecords(
        uint256 tokenId
    ) external onlyApprovedOrOwner(_domainTokenId(tokenId)) {
        _resetRecords(tokenId);
    }

    function _setRecord(
        uint256 tokenId,
        uint256 keyHash,
        string calldata value
    ) internal {
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
