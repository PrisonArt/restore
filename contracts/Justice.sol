// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import { Pausable } from '@openzeppelin/contracts/security/Pausable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IJustice } from './interfaces/IJustice.sol';
import { IRestore } from './interfaces/IRestore.sol';
import { IWETH } from './interfaces/IWETH.sol';

/**
 * @title Justice
 *
 * Justice - a contract that creates unique NFTs to be auctioned off, using the Restore the ERC721 Contract.
 *
 * Adapted from the wonderful people at Nounders DAO.
 *
 * Once auctioned, this contract does not immediatedly transfer the art, but 'freezes' it, while ensuring that the owner of the system,
 * which is multisig owned by Pr1s0n Art Inc - a 501(c)3 registered in Florida - can only ever transfer them to the winning bidder.
 * Pr1s0n Art takes the funds raised from the sale, exchanges them into USD, pays the Legal Financial Obligations of the people who
 * made the art and then reattaches the receipts as the `data` in `transferToBuyer`, which uses the `safeTransferFrom` method in the
 * ERC721 standard.
 *
 * This means you receive not just the art, but the full story - aesthetic, economic and sociopolitical - of a human being's journey
 * home. This contract enacts restorative justice because, unless we are all involved with justice, we will never realise it fully.
 */
                                                                                                                                                                           

abstract contract Justice is IJustice, ReentrancyGuard, Ownable, Pausable {
    // The Restore ERC721 token contract
    IRestore public restore;

    // The address of the WETH contract
    address public weth;

    // The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    // The minimum price accepted in an auction
    uint256 public reservePrice;

    // The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    // The duration of a single auction
    uint256 public duration;

    // The active auction
    IJustice.Auction public auction;

    /**
     * @notice Initialize the auction house and base contracts,
     * populate configuration values, and pause the contract.
     * @dev This function can only be called once.
     */
    function initialize(
        IRestore _restore,
        address _weth,
        uint256 _timeBuffer,
        uint256 _reservePrice,
        uint8 _minBidIncrementPercentage,
        uint256 _duration
    ) external {

        _pause();

        restore = _restore;
        weth = _weth;
        timeBuffer = _timeBuffer;
        reservePrice = _reservePrice;
        minBidIncrementPercentage = _minBidIncrementPercentage;
        duration = _duration;
    }

    /**
     * @notice Settle the current auction, and freeze the NFT, enuring only the buyer will receive it.
     * TODO: should this be onlyOwner protected?
     */
    function settleCurrentAuction() external nonReentrant whenNotPaused {
        _settleAuction();
    }

    /**
     * @notice Settle the current auction.
     * @dev This function can only be called when the contract is paused.
     */
    function settleAuction() external override whenPaused nonReentrant {
        _settleAuction();
    }

    /**
     * @notice Create a bid for a pr1s0n.art piece, with a given amount.
     * @dev This contract only accepts payment in ETH.
     */
    function createBid(uint256 tokenId) external payable override nonReentrant {
        IJustice.Auction memory _auction = auction;

        require(_auction.tokenId == tokenId, 'Justice: Art not up for auction');
        require(block.timestamp < _auction.endTime, 'Justice: Auction expired');
        require(msg.value >= reservePrice, 'Justice: Must send at least reservePrice');
        require(
            msg.value >= _auction.amount + ((_auction.amount * minBidIncrementPercentage) / 100),
            'Justice: Must send more than last bid by minBidIncrementPercentage amount'
        );

        address payable lastBidder = _auction.bidder;

        // Refund the last bidder, if applicable
        if (lastBidder != address(0)) {
            _safeTransferETHWithFallback(lastBidder, _auction.amount);
        }

        auction.amount = msg.value;
        auction.bidder = payable(msg.sender);

        // Extend the auction if the bid was received within `timeBuffer` of the auction end time
        bool extended = _auction.endTime - block.timestamp < timeBuffer;
        if (extended) {
            auction.endTime = _auction.endTime = block.timestamp + timeBuffer;
        }

        emit AuctionBid(_auction.tokenId, msg.sender, msg.value, extended);

        if (extended) {
            emit AuctionExtended(_auction.tokenId, _auction.endTime);
        }
    }

    /**
     * @notice Pause the Justice auction house.
     * @dev This function can only be called by the owner when the
     * contract is unpaused. While no new auctions can be started when paused,
     * anyone can settle an ongoing auction.
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the Justice auction house.
     * @dev This function can only be called by the owner when the contract is paused.
     */
    function unpause() external override onlyOwner {
        _unpause();
    }

    /**
     * @notice Set the auction time buffer.
     * @dev Only callable by the owner.
     */
    function setTimeBuffer(uint256 _timeBuffer) external override onlyOwner {
        timeBuffer = _timeBuffer;

        emit AuctionTimeBufferUpdated(_timeBuffer);
    }

    /**
     * @notice Set the auction reserve price.
     * @dev Only callable by the owner.
     */
    function setReservePrice(uint256 _reservePrice) external override onlyOwner {
        reservePrice = _reservePrice;

        emit AuctionReservePriceUpdated(_reservePrice);
    }

    /**
     * @notice Set the auction minimum bid increment percentage.
     * @dev Only callable by the owner.
     */
    function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage) external override onlyOwner {
        minBidIncrementPercentage = _minBidIncrementPercentage;

        emit AuctionMinBidIncrementPercentageUpdated(_minBidIncrementPercentage);
    }

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the `auction` state variable and emit an AuctionCreated event.
     * If the mint reverts, dragons are unleashed. To remedy this, catch the revert and pause this contract.
     * @param creator the address of creator of the piece, if they have one. Otherwise pr1s0n.art.
     * @param uri the permanent uri which stores all the artistic info, less the receipt. 
     * TODO should we change this to public given the onlyOwner protection on mintForAuction? If so, should we
            just revert() on an error, rather than pause the whole thing? Do we really need pauses at all?
     */
    function createAuction(address creator, string memory uri) public onlyOwner whenNotPaused {
        try restore.mintForAuction(creator, uri) returns (uint256 tokenId) {
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + duration;

            auction = Auction({
                tokenId: tokenId,
                amount: 0,
                startTime: startTime,
                endTime: endTime,
                bidder: payable(0),
                settled: false
            });

            emit AuctionCreated(tokenId, startTime, endTime);
        } catch Error(string memory) {
            _pause();
        }
    }

    /**
     * @notice Settle an auction, freezing the tokenId to the buyer's address and sending the funds to pr1s0n.art for processing.
     * @dev If there are no bids, the art is transferred back to pr1s0n.art to be returned or burnt.
     * TODO: We should send the funds to a splitter contract, not directly to pr1s0n.art to handle the case where artists do want
     *       their share in crypto.
     */
    function _settleAuction() internal {
        IJustice.Auction memory _auction = auction;

        require(_auction.startTime != 0, "Justice: Auction hasn't begun");
        require(!_auction.settled, 'Justice: Auction has already been settled');
        require(block.timestamp >= _auction.endTime, "Justice: Auction hasn't completed");

        auction.settled = true;

        if (_auction.bidder == address(0)) {
            restore.transferToBuyer(bytes('no buyer'));
        } else {
            restore.freeze(_auction.bidder, _auction.tokenId);
        }

        if (_auction.amount > 0) {
            _safeTransferETHWithFallback(owner(), _auction.amount);
        }

        emit AuctionSettled(_auction.tokenId, _auction.bidder, _auction.amount);
    }

    /**
     * @notice Transfer ETH. If the ETH transfer fails, wrap the ETH and try send it as WETH.
     */
    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWETH(weth).deposit{ value: amount }();
            IERC20(weth).transfer(to, amount);
        }
    }

    /**
     * @notice Transfer ETH and return the success status.
     * @dev This function only forwards 30,000 gas to the callee.
     */
    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        (bool success, ) = to.call{ value: value, gas: 30_000 }(new bytes(0));
        return success;
    }

}
