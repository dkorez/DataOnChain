//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

contract DataOnChain {
    struct Document {
        bytes contentHash;
        address owner;
    }

    mapping(address => Document[]) public documents;

    address[] public authorities;
    uint256 private authoritiesCount;

    event DocumentCreated(address indexed, bytes32, address);

    event AuthorityAdded(address indexed, address);
    event AuthorityRemoved(address indexed, address);

    constructor() {
        authorities.push(msg.sender);
        authoritiesCount++;
    }

    /* save full document content, not gas optimised */
    function getDocumentHash(uint index) public view returns(bytes memory) {
        Document memory document = documents[msg.sender][index];
        require((document.owner == msg.sender || isAuthority(msg.sender)), "NOT_AUTHORISED");

        return documents[msg.sender][index].contentHash;
    }

    function getDocument(uint index) public view returns(string memory) {
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
    /* end of save full document content */

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
}
