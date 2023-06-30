// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DisputeInitiation.sol";

contract MkpebiResolutio is ERC1155, Ownable {
    Disputepool _disputePool;
    uint256[] public availableTokens;
    mapping(uint256 => string) private _uris;

    constructor(address disputePoolContractAddress)
        ERC1155("ResolutioDecisonToken")
    {
        _disputePool = Disputepool(
            disputePoolContractAddress
        );
    }

    function mintToken(
        uint256 disputeId,
        uint256 amount,
        string memory _uri
    ) external onlyOwner {

        bytes memory exisitingUrl = bytes(_uris[disputeId]);
        if (exisitingUrl.length != 0) {
            revert("Already Minted!");
        }

        bool isValidDispute = _disputePool.isValidDispute(disputeId);   

        if (!isValidDispute){
            revert("Invalid Dispute Id");
        } 

        _uris[disputeId] = _uri;
        availableTokens.push(disputeId);
        _mint(msg.sender, disputeId, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    function setTokenUri(uint256 tokenId, string memory _uri)
        external
        onlyOwner
    {
        _uris[tokenId] = _uri;
    }

    function airDropToken(
        uint256 tokenId,
        uint256 quantity,
        address[] memory addresses
    ) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            safeTransferFrom(
                msg.sender,
                addresses[i],
                tokenId,
                quantity,
                "0x0"
            );
        }
    }
}
