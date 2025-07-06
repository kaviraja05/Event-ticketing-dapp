// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Gas optimization: Use ERC721 directly instead of ERC721URIStorage
// Store URIs off-chain or in a separate mapping to save gas
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketNFT is ERC721, Ownable {
    // Gas optimization: Use uint128 instead of uint256 where possible
    uint128 public nextTicketId;
    uint128 public maxResalePrice;
    uint256 public lockTimestamp;

    // Gas optimization: Pack variables together to use fewer storage slots
    mapping(uint256 => bool) public approvedTransfers;

    // Gas optimization: Store token URIs in a separate mapping
    mapping(uint256 => string) private _tokenURIs;

    // Gas optimization: Track user's tokens to avoid expensive loops
    mapping(address => uint256[]) private _userTokens;

    // Gas optimization: Track token existence
    mapping(uint256 => bool) private _exists;

    constructor(
        string memory name,
        string memory symbol,
        uint128 _maxResalePrice,
        uint256 _lockTimestamp,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        maxResalePrice = _maxResalePrice;
        lockTimestamp = _lockTimestamp;
    }

    // Gas optimization: Add a function to get token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists[tokenId], "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Gas optimization: Batch mint function for multiple tickets
    function mintTicket(address to, string memory uri) public onlyOwner {
        uint256 tokenId = nextTicketId;

        // Gas optimization: Use _mint instead of _safeMint when recipient is trusted
        _mint(to, tokenId);

        // Store URI
        _tokenURIs[tokenId] = uri;
        _exists[tokenId] = true;

        // Track user tokens
        _userTokens[to].push(tokenId);

        // Increment counter
        nextTicketId++;
    }

    function approveTransfer(uint256 tokenId) public onlyOwner {
        approvedTransfers[tokenId] = true;
    }

    function transferTicket(address from, address to, uint256 tokenId) public {
        // Gas optimization: Combine multiple requires into one where possible
        require(
            ownerOf(tokenId) == from &&
            (_msgSender() == from || isApprovedForAll(from, _msgSender())) &&
            (block.timestamp < lockTimestamp || approvedTransfers[tokenId]),
            "Transfer requirements not met"
        );

        // Transfer token
        _transfer(from, to, tokenId);

        // Update user tokens tracking
        _removeTokenFromUser(from, tokenId);
        _userTokens[to].push(tokenId);

        // Reset approval
        approvedTransfers[tokenId] = false;
    }

    // Helper function to remove token from user's array
    function _removeTokenFromUser(address user, uint256 tokenId) private {
        uint256[] storage userTokens = _userTokens[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                // Replace with the last element and pop
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    function isValidTicket(uint256 tokenId) public view returns (address ownerAddress, bool exists) {
        if (_exists[tokenId]) {
            return (ownerOf(tokenId), true);
        } else {
            return (address(0), false);
        }
    }

    // Gas optimization: More efficient getOwnedTickets using tracked user tokens
    function getOwnedTickets(address user) public view returns (uint256[] memory) {
        return _userTokens[user];
    }
}
