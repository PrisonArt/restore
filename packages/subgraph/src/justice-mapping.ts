import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
  OwnershipTransferred,
} from '../generated/Justice/Justice'
import { Auction, NFT, Bid } from '../generated/schema'
import { getOrCreateAccount } from './utils/helpers';

export function handleAuctionBid(event: AuctionBid): void {
  const tokenId = event.params.tokenId.toString();
  const bidderAddress = event.params.sender.toHex();

  const bidder = getOrCreateAccount(bidderAddress);

  const auction = Auction.load(tokenId);
  if (auction == null) {
    log.error('[handleAuctionBid] Auction not found for NFT #{}. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  const bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.nft = auction.nft;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

// TODO: Add saleSplit
export function handleAuctionCreated(event: AuctionCreated): void {
  const tokenId = event.params.tokenId.toString();

  const nft = NFT.load(tokenId);
  if (nft == null) {
    log.error('[handleAuctionCreated] NFT #{} not found. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const auction = new Auction(tokenId);
  auction.nft = nft.id;
  auction.amount = BigInt.fromI32(0);
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  auction.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  const tokenId = event.params.tokenId.toString();

  const auction = Auction.load(tokenId);
  if (auction == null) {
    log.error('[handleAuctionExtended] Auction not found for NFT #{}. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.endTime = event.params.endTime;
  auction.save();
}

// TODO: update isFrozen
export function handleAuctionSettled(event: AuctionSettled): void {
  const tokenId = event.params.tokenId.toString();

  const auction = Auction.load(tokenId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for NFT #{}. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.settled = true;
  auction.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

