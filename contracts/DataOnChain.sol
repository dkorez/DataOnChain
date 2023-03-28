//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

//import "@openzeppelin/contracts/access/AccessControl.sol";

contract DataOnChain {
    struct Document {
        bytes contentHash;
        address owner;
    }

    struct DocumentHash {
        bytes32 contentHash;
        address owner;
    }

    struct UserDocument {
        bytes32 uuid;
        bytes32 contentHash;
    }

    mapping(address => Document[]) public documents;

    mapping(bytes32 => DocumentHash) private documentHashes;
    mapping(uint256 => bytes32) private userHashes;
    uint256 private userHashesIndex;

    address[] public authorities;
    uint256 private authoritiesCount;


    // store user data

    // validate user data -> encode off chain, store hash, 


    constructor() {
        authorities.push(msg.sender);
        authoritiesCount++;
    }

    //TODO: add / remove authorities

    /* save full document content */
    function getDocumentHash(uint index) public view returns(bytes memory) {
        Document memory document = documents[msg.sender][index];
        require((document.owner == msg.sender || isAuthority(msg.sender)), "NOT_AUTHORISED");

        return documents[msg.sender][index].contentHash;
    }

    function getDocumentContent(uint index) public view returns(string memory) {
        bytes memory documentContent = getDocumentHash(index);
        return abi.decode(documentContent, (string));
    }

    function addDocument(string memory content) public {
        bytes memory documentContent = abi.encode(content);

        documents[msg.sender].push(Document(documentContent, msg.sender));
    }

    function addDocumentHash(bytes memory documentContent) public {

        documents[msg.sender].push(Document(documentContent, msg.sender));
    }


    /* save hashes only */
    function generateDocumentSaltForUser(bytes32 uuid, address user) public returns(bytes32) {
        bytes32 contentHash = bytes32(keccak256(abi.encodePacked(uuid, block.timestamp, block.number)));

        documentHashes[uuid] = DocumentHash(contentHash, user);
        userHashes[userHashesIndex] = uuid;
        userHashesIndex++;

        return contentHash;
    }

    function generateDocumentSalt(bytes32 uuid) public returns(bytes32) {
        return generateDocumentSaltForUser(uuid, msg.sender);
    }

    function getDocumentSalt(bytes32 uuid) public view returns(bytes32) {
        DocumentHash memory document = documentHashes[uuid];

        require((document.owner == msg.sender || isAuthority(msg.sender)), "NOT_AUTHORISED");

        return document.contentHash;
    }

    function getUserDocumentHashes(address user) public view returns(bytes32[] memory) {
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

    function getUserDocuments(address user) public view returns(UserDocument[] memory) {
        UserDocument[] memory _userDocuments = new UserDocument[](getUserDocumentCount(user));

        uint256 j = 0;
        for (uint256 i=0; i<userHashesIndex; i++) {
            bytes32 userHash = userHashes[i];
            if (documentHashes[userHash].owner == user) {
                _userDocuments[j] = UserDocument(userHash, documentHashes[userHash].contentHash);
                j++;
            }
        }

        return _userDocuments;
    }

    /** TODO: refactor, unneccessary */
    function getDocumentContentByHash(bytes32 uuid, bytes memory payload) public view returns(bytes32, string memory, bytes32) {
        (bytes32 _uuid, string memory _content, bytes32 _salt) = abi.decode(payload, (bytes32, string, bytes32));

        //DocumentHash memory document = documentHashes[uuid];
        //bytes32 salt = document.contentHash;
        //require(_uuid == uuid && _salt == salt, "ENCODE NOT MATCH");

        return (_uuid, _content, _salt);
    }


    /** Helper functions */
    function generateUUID() private view returns(bytes32) {
        return bytes32(keccak256(abi.encodePacked(block.timestamp, block.number, msg.sender)));
    }

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

    function isAuthority(address caller) private view returns(bool) {
        for (uint256 i=0; i<authoritiesCount; i++) {
            if (caller == authorities[authoritiesCount]) {
                return true;
            }
        }

        return false;
    }
}
