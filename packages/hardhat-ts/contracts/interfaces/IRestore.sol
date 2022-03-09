// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

interface IRestore {

    event ReadyForAuction(uint256 tokenId, string uri);

    event ArtFrozen(address buyer, uint256 indexed tokenId);

    event ArtTransferred(uint256 indexed tokenID, bytes data);

    function transferToBuyer(uint256 frozenTokenId, bytes memory data) external;

    function mintForAuction(address creator, string memory uri) external returns (uint256 tokenId);

    function freeze(address _buyer, uint256 _tokenId) external;
}