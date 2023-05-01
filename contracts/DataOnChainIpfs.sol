//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

contract DataOnChain {

    struct DocumentHash {
        bytes32 contentHash;
        bytes ipfsHash;
        address owner;
    }

    mapping(bytes32 => DocumentHash) private documentHashes;
    mapping(uint256 => bytes32) private userHashes;
    uint256 private userHashesIndex;

    address[] public authorities;
    uint256 private authoritiesCount;

    event DocumentCreated(address indexed, bytes32, address);
    event DocumentUpdated(bytes32, address);

    event AuthorityAdded(address indexed, address);
    event AuthorityRemoved(address indexed, address);

    constructor() {
        authorities.push(msg.sender);
        authoritiesCount++;
    }

    function generateDocumentSecretForUser(bytes32 uuid, address user) public {
        bytes32 contentHash = bytes32(keccak256(abi.encodePacked(uuid, block.timestamp, block.number)));

        documentHashes[uuid] = DocumentHash(contentHash, "", user);
        userHashes[userHashesIndex] = uuid;
        userHashesIndex++;

        emit DocumentCreated(user, uuid, msg.sender);
    }

    function generateDocumentSecret(bytes32 uuid) public {
        generateDocumentSecretForUser(uuid, msg.sender);
    }

    function updateDocument(bytes32 uuid, bytes calldata ipfsHash) public {
        require(_isAuthorised(msg.sender, uuid), "NOT_AUTHORISED");

        documentHashes[uuid].ipfsHash = ipfsHash;
        emit DocumentUpdated(uuid, msg.sender);
    }

    function getDocumentSecret(bytes32 uuid) public view returns(bytes32) {
        require(_isAuthorised(msg.sender, uuid), "NOT_AUTHORISED");

        return documentHashes[uuid].contentHash;
    }

    function getDocumentIpfsHash(bytes32 uuid) public view returns(bytes memory) {
        require(_isAuthorised(msg.sender, uuid), "NOT_AUTHORISED");

        return documentHashes[uuid].ipfsHash;
    }

    function getDocumentStruct(bytes32 uuid) public view returns(DocumentHash memory) {
        require(_isAuthorised(msg.sender, uuid), "NOT_AUTHORISED");

        return documentHashes[uuid];
    }

    function getDocumentContent(bytes32 uuid, bytes memory payload) public view returns(string memory) {
        (bytes memory _uuid, string memory _content, bytes memory _secret) = abi.decode(payload, (bytes, string, bytes));

        DocumentHash memory document = documentHashes[uuid];
        bytes32 secret = document.contentHash;
        
        bytes memory bSecret = bytes.concat(secret);
        bytes memory bUuid = bytes.concat(uuid);

        require(keccak256(_uuid) == keccak256(bUuid), "UUID_NOT_MATCH");
        require(keccak256(_secret) == keccak256(bSecret), "SECRET_NOT_MATCH");

        return (_content);
    }

    function getDocumentHashesForUser(address user) public view returns(bytes32[] memory) {
        bytes32[] memory _userHashes = new bytes32[](getUserDocumentCount(user));

        uint256 j = 0;
        for (uint256 i=0; i<userHashesIndex; i++) {
            bytes32 userHash = userHashes[i];
            if (documentHashes[userHash].owner == user) {
                _userHashes[j] = userHash;
                j++;
            }
        }

        return _userHashes;
    }

    /* functions to manage authorities */
    function isAuthority(address caller) private view returns(bool) {
        for (uint256 i=0; i<authoritiesCount; i++) {
            if (caller == authorities[authoritiesCount]) {
                return true;
            }
        }
        return false;
    }

    function addAuthority(address auth) public {
        require(isAuthority(msg.sender), "NOT_AUTHORISED");

        bool authFound = false;
        for (uint i=0; i<authoritiesCount; i++) {
            if (authorities[i] == auth) {
                authFound = true;
                break;
            }
        }

        require(authFound == false, "AUTHORITY_EXISTS");
        authorities.push(auth);
        authoritiesCount++;
        emit AuthorityAdded(auth, msg.sender);
    }

    function removeAuthority(address auth) public {
        require(isAuthority(msg.sender), "NOT_AUTHORISED");
        require(authoritiesCount >= 1, "ONE_AUTHORITY_REQUIRED");

        bool authFound = false;
        uint256 authIndex = 0;
        for (uint i=0; i<authoritiesCount; i++) {
            if (authorities[i] == auth) {
                authFound = true;
                authIndex = i;
                break;
            }
        }
        require(authFound == true, "AUTHORITY_NOT_FOUND");

        if (authIndex < authoritiesCount) {
            for (uint i=authIndex; i<authoritiesCount-1; i++) {
                authorities[i] = authorities[i+1];
            }
            authorities.pop();
            authoritiesCount--;
        }

        emit AuthorityRemoved(auth, msg.sender);
    }

    function _isAuthorised(address sender, bytes32 uuid) internal view returns(bool) {
        return (documentHashes[uuid].owner == sender || isAuthority(sender));
    }

    /* helper functions */
    function getUserDocumentCount(address user) private view returns(uint256) {
        uint256 docCount = 0;
        for (uint256 i=0; i<userHashesIndex; i++) {
            bytes32 userHash = userHashes[i];
            if (documentHashes[userHash].owner == user) {
                docCount++;
            }
        }
        return docCount;
    }
    /* end helper functions */
}
