// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SocialMonkeys is ERC721URIStorage {
    using Counters for Counters.Counter;

    event URISet(uint256 indexed tokenId, string tokenURI);

    Counters.Counter private _counter;
    mapping(address => uint256) private _owners;

    constructor() ERC721("Social Monkey Tokens", "CMT") {}

    // TODO: Check that the caller is a member of the club
    function create(string memory tokenURI) public {
        // Check
        require(_owners[msg.sender] == 0, "Already created");
        // Update counter
        _counter.increment();
        // Mint token
        uint256 tokenId = _counter.current();
        _mint(msg.sender, tokenId);
        _owners[msg.sender] = tokenId;
        // Set URI
        _setTokenURI(tokenId, tokenURI);
        emit URISet(tokenId, tokenURI);
    }

    function edit(string memory tokenURI) public {
        // Check
        require(_owners[msg.sender] != 0, "Not created");
        // Update
        _setTokenURI(_owners[msg.sender], tokenURI);
        emit URISet(_owners[msg.sender], tokenURI);
    }

    function getTokenId(address owner) external view returns (uint) {
        return _owners[owner];
    }

    function getURI(address owner) external view returns (string memory) {
        uint256 tokenId = _owners[owner];
        if (_exists(tokenId)) {
            return tokenURI(tokenId);
        } else {
            return "";
        }
    }
}
