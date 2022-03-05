// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ERC721Justice
 *
 * ERC721Justice - a contract that creates unique NFTs to be auctioned off. 
 *
 * Once auctioned, it does not immediatedly transfer them, but 'freezes' them, while ensuring that the owner of this contract,
 * which is multisig owned by Pr1s0n Art Inc - a 501(c)3 registered in Florida - can only ever transfer them to the winning bidder.
 * Pr1s0n Art takes the funds raised from the sale, exchanges them into USD, pays the Legal Financial Obligations of the people who
 * made the art and then reattaches the receipts as the `data` in `transferToBuyer`, which uses the `safeTransferFrom` method in the
 * ERC721 standard.
 *
 * This means you receive not just the art, but the full story - aesthetic, economic and sociopolitical - of a human being's journey
 * home. This contract enacts restorative justice because, unless we are all involved with justice, we will never realise it fully.
 */
contract ERC721Justice is
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to frozen address
    mapping(uint256 => address) private _frozen;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {} 

    /**
     * @notice Safely mints a token to an address with a tokenURI. 
     *         Protected by onlyOwner as only pr1s0n.art should mint NFTs here.
     * @param to address of the future owner of the token
     * @param metadataURI full URI to token metadata
     */
    function safeMint(address to, string memory metadataURI)
        public
        onlyOwner 
        returns (uint256 tokenId)
    {
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        _tokenIdCounter.increment();
        return newTokenId;
    }

    /**
     * @notice sends 'frozen' NFT to the winning bidder by attaching the receipt
     * @param data full URI to token metadata
     */
    function transferToBuyer(string memory data)
        public
        onlyOwner
    {

    }

    /**
     * @notice called by the auction contract when the bidding is over and we have a winner
     * @param buyer address of winning bid
     * @param tokenId index of the NFT bought in the auction
     */
    function _freeze(address buyer, uint256 tokenId) 
        internal 
    {

    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
