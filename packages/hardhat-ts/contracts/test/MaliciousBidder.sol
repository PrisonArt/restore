// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { IJustice } from '../interfaces/IJustice.sol';

contract MaliciousBidder {
    function bid(IJustice auction, uint256 tokenId) public payable {
        auction.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
