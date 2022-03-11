// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

interface IRestore {

    // Keep track of currently frozen token and who bought it.
    struct FrozenToken {
        uint256 tokenId;
        address buyer;
    }

    event ReadyForAuction(uint256 tokenId, string uri);

    event ArtTransferred(address buyer, uint256 indexed tokenID, bytes data);

    function transferToBuyer(uint256 frozenTokenId, bytes memory data) external;

    function mintForAuction(address creator, string memory uri) external returns (uint256 tokenId);

    function returnToPA(uint256 frozenTokenId, bytes memory data) external;
}