// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

interface IRestore is IERC721, IERC721Enumerable {

    event ReadyForAuction(address to, uint256 tokenId, string uri);

    event ArtFrozen(address buyer, uint256 indexed tokenId);

    event ArtTransferred(address buyer, uint256 indexed tokenId, bytes data);

    function mintForAuction(address creator, string memory uri) external returns (uint256 tokenId);

    function transferToBuyer(uint256 tokenId, bytes memory data) external;

    function returnToPA(uint256 tokenId, bytes memory data) external;

    function freeze(address buyer, uint256 frozenTokenId) external;
}