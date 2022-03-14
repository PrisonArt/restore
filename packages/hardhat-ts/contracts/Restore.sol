// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import { ERC721Tradable } from "./base/ERC721Tradable.sol";
import { ERC721 } from "./base/ERC721.sol";
import { IRestore } from "./interfaces/IRestore.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";

//           _____                    _____                    _____                _____                   _______                   _____                    _____          
//          /\    \                  /\    \                  /\    \              /\    \                 /::\    \                 /\    \                  /\    \         
//         /::\    \                /::\    \                /::\    \            /::\    \               /::::\    \               /::\    \                /::\    \        
//        /::::\    \              /::::\    \              /::::\    \           \:::\    \             /::::::\    \             /::::\    \              /::::\    \       
//       /::::::\    \            /::::::\    \            /::::::\    \           \:::\    \           /::::::::\    \           /::::::\    \            /::::::\    \      
//      /:::/\:::\    \          /:::/\:::\    \          /:::/\:::\    \           \:::\    \         /:::/~~\:::\    \         /:::/\:::\    \          /:::/\:::\    \     
//     /:::/__\:::\    \        /:::/__\:::\    \        /:::/__\:::\    \           \:::\    \       /:::/    \:::\    \       /:::/__\:::\    \        /:::/__\:::\    \    
//    /::::\   \:::\    \      /::::\   \:::\    \       \:::\   \:::\    \          /::::\    \     /:::/    / \:::\    \     /::::\   \:::\    \      /::::\   \:::\    \   
//   /::::::\   \:::\    \    /::::::\   \:::\    \    ___\:::\   \:::\    \        /::::::\    \   /:::/____/   \:::\____\   /::::::\   \:::\    \    /::::::\   \:::\    \  
//  /:::/\:::\   \:::\____\  /:::/\:::\   \:::\    \  /\   \:::\   \:::\    \      /:::/\:::\    \ |:::|    |     |:::|    | /:::/\:::\   \:::\____\  /:::/\:::\   \:::\    \ 
// /:::/  \:::\   \:::|    |/:::/__\:::\   \:::\____\/::\   \:::\   \:::\____\    /:::/  \:::\____\|:::|____|     |:::|    |/:::/  \:::\   \:::|    |/:::/__\:::\   \:::\____\
// \::/   |::::\  /:::|____|\:::\   \:::\   \::/    /\:::\   \:::\   \::/    /   /:::/    \::/    / \:::\    \   /:::/    / \::/   |::::\  /:::|____|\:::\   \:::\   \::/    /
//  \/____|:::::\/:::/    /  \:::\   \:::\   \/____/  \:::\   \:::\   \/____/   /:::/    / \/____/   \:::\    \ /:::/    /   \/____|:::::\/:::/    /  \:::\   \:::\   \/____/ 
//        |:::::::::/    /    \:::\   \:::\    \       \:::\   \:::\    \      /:::/    /             \:::\    /:::/    /          |:::::::::/    /    \:::\   \:::\    \     
//        |::|\::::/    /      \:::\   \:::\____\       \:::\   \:::\____\    /:::/    /               \:::\__/:::/    /           |::|\::::/    /      \:::\   \:::\____\    
//        |::| \::/____/        \:::\   \::/    /        \:::\  /:::/    /    \::/    /                 \::::::::/    /            |::| \::/____/        \:::\   \::/    /    
//        |::|  ~|               \:::\   \/____/          \:::\/:::/    /      \/____/                   \::::::/    /             |::|  ~|               \:::\   \/____/     
//        |::|   |                \:::\    \               \::::::/    /                                  \::::/    /              |::|   |                \:::\    \         
//        \::|   |                 \:::\____\               \::::/    /                                    \::/____/               \::|   |                 \:::\____\        
//         \:|   |                  \::/    /                \::/    /                                      ~~                      \:|   |                  \::/    /        
//          \|___|                   \/____/                  \/____/                                                                \|___|                   \/____/         


contract Restore is ERC721Tradable, Ownable, IRestore {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // A mapping of all frozen tokens
    mapping(uint256 => address) buyers;

    constructor(
        address _proxyRegistryAddress
    ) ERC721Tradable('Restore', 'REST', _proxyRegistryAddress) {}

    /**
     * @dev Link to Contract metadata https://docs.opensea.io/docs/contract-level-metadata
     * TODO: add contract metadata
    */
    function contractURI() public pure returns (string memory) {
        return "https://arweave.net/";
    }

    /** @notice Set the royalties for the whole contract. Our intention is to set it to 10% in perpetuity.
     *  @param recipient the royalties recipient - will always be pr1s0nart, for regulatory reasons.
     *  @param value royalties value (between 0 and 10000)
    */
    function setRoyalties(address recipient, uint256 value) 
        public 
        onlyOwner
    {
        _setRoyalties(recipient, value);
    }

    /**
     * @dev Safely mints a token to an address with a tokenURI.
     * @notice this mints the NFT to this contract so that we can ensure only the buyer can receive the first transfer and
     *         prove contractually that no-one else can.
     * @param creator this will likely be pr1s0n.art, but may be others in the future. Included here for proper attribution.
     * @param uri full URI to token metadata
     */
    function mintForAuction(address creator, string memory uri)
        public
        override
        onlyOwner
        returns (uint256 tokenId)
    {
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(creator, address(this), newTokenId);
        onERC721Received(creator, address(0), newTokenId, bytes("New token ready for auction"));
        _setTokenURI(newTokenId, uri);
        _tokenIdCounter.increment();

        emit ReadyForAuction(newTokenId, uri);

        return(newTokenId);
    }

    /**
     * @notice sends 'frozen' NFT to the winning bidder by attaching the receipt. Protected only to ensure no random
     *         data is uploaded on the transfer.
     * @param data URI to receipt metadata that will be added to the NFT
     * TODO: is it an issue that we store the receipt uri in bytes and the metadata uri above as a string?
     */
    function transferToBuyer(uint256 tokenId, bytes memory data)
        public
        onlyOwner
    {
        _safeTransfer(address(this), buyers[tokenId], tokenId, data);
        emit ArtTransferred(buyers[tokenId], tokenId, data);
    }

    /**
     * @notice called when there is no buyer for an auction
     * @param tokenId index of the NFT bought in the auction
     * @param data data which reads 'no buyer' to add to token's transactional history for completeness.
     */
    function returnToPA(uint256 tokenId, bytes memory data) 
        public
        override
    {
        require(tx.origin == owner(), "Restore: unbought auction must be settled by owner");
        _safeTransfer(address(this), owner(), tokenId, data);
    }

    /**
     * @notice called when an auction is settled, sets the frozenToken struct.
     * @param buyer address of winning bid
     * @param tokenId index of the NFT bought in the auction
     */
    function freeze(address buyer, uint256 tokenId) 
        public
        override
    {
        require(tx.origin == owner(), "Restore: auctioned piece must be frozen by owner");
        buyers[tokenId] = buyer;
        emit ArtFrozen(buyer, tokenId);
    }

}