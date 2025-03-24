// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WordMatchAchievement is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIds;
    string private _baseTokenURI;
    uint256 public constant REQUIRED_SCORE = 100;
    
    // Mapping to track if a player has already received their achievement NFT
    mapping(address => bool) public hasClaimed;
    
    // Mapping to track verified scores
    mapping(address => uint256) public verifiedScores;
    
    constructor() ERC721("Word Match Achievement", "WMA") Ownable(msg.sender) {
        _baseTokenURI = "https://nft.zora.co/token/base/";
    }
    
    function setVerifiedScore(address player, uint256 score) external onlyOwner {
        verifiedScores[player] = score;
    }
    
    function claimAchievement() external {
        require(!hasClaimed[msg.sender], "Achievement already claimed");
        require(verifiedScores[msg.sender] >= REQUIRED_SCORE, "Score requirement not met");
        
        _tokenIds++;
        _safeMint(msg.sender, _tokenIds);
        hasClaimed[msg.sender] = true;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), address(this), "/", _toString(tokenId)));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
} 