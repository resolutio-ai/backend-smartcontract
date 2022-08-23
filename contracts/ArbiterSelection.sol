// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ArbiterNFT is ERC721("ResolutioArbiter", "Arbiter"),
    Ownable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Arbiter {
        bool isActive;
        uint256 mintCount;
    }

    event WhiteListed(address arbiter, uint timeStamp);

    /// @dev links a user address to their arbiter details
    mapping(address => Arbiter) whitelistedAddresses;

    /// @dev Modifier to confirm that address is whitelisted
    modifier isWhitelisted(address _address) {
        require(
            whitelistedAddresses[_address].isActive,
            "Whitelist: You need to be whitelisted"
        );
        _;
    }

    /// @dev Adds a user to the list of selected or whitelisted arbiters stored within the smart contract.
    /// @notice Should mint token to whitelisted user.
    /// @dev This function is only callable by the owner/admin of the contract.
    /// @dev This function can only be called once per arbiter.
    /// @param _addressToWhitelist, the wallet address of the arbiter to be added.
    function addUser(address _addressToWhitelist) external onlyOwner {
        Arbiter memory arbiter = whitelistedAddresses[_addressToWhitelist];

        require(!arbiter.isActive && arbiter.mintCount == 0, "Already whitelisted");

        arbiter.isActive = true;
        arbiter.mintCount = 1;
         
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(_addressToWhitelist, newItemId);
        whitelistedAddresses[_addressToWhitelist] = arbiter;

        emit WhiteListed(_addressToWhitelist, block.timestamp);       
    }

    /// @dev Verifies that a user's wallet address is amongst the selected addresses stored in the smart contract.
    /// @param _whitelistedAddress, the wallet address of the arbiter to be added.
    /// @return a boolean representing the result of the verification
    function verifyUser(address _whitelistedAddress)
        public
        view
        returns (bool)
    {
        bool userIsWhitelisted = whitelistedAddresses[_whitelistedAddress]
            .isActive;
        return userIsWhitelisted;
    }

    /// @notice Should transfer NFT from one user to another
    /// @dev Since the Arbiter NFT is not to be transferrable, Transfer function has been overriden to prevent transfer of ArbiterNFT
    /// @param from address of the sender of the NFT
    /// @param to address of the receiver of the NFT
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {}   
    
}
