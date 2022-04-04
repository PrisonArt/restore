import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
  OwnershipTransferred,
} from '../generated/Justice/Justice'
import { Account, Auction, NFT, Bid } from '../generated/schema'
import { getOrCreateAccount } from './utils/helpers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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

export function handleAuctionCreated(event: AuctionCreated): void {
  const tokenId = event.params.tokenId.toString();
  const saleSplit = event.params.saleSplit;
  const creatorAddress = event.params.creator.toHex();
  const creator = getOrCreateAccount(creatorAddress);

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
  auction.saleSplit = saleSplit;
  auction.creator = creator.id;
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

export function handleAuctionSettled(event: AuctionSettled): void {
  const tokenId = event.params.tokenId.toString();
  const winnerAddress = event.params.winner.toHex();
  const amount = event.params.amount;

  const winner: Account = getOrCreateAccount(winnerAddress);

  const auction = Auction.load(tokenId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for NFT #{}. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let nftIsFrozen = true;
  if (winner.id == ZERO_ADDRESS) {
    nftIsFrozen = false;
  }

  auction.winner = winner.id;
  auction.amount = amount;
  auction.settled = true; // auction is settled whether or not there was a winner
  auction.save();

  log.error('[handleAuctionSettled] tokenId #{} winner: {} amoutn: {}', [
    tokenId,
    winner.id,
    amount.toString()
  ]);

  const nft = NFT.load(tokenId);
  if (nft == null) {
    log.error('[handleAuctionSettled] NFT #{} not found. Hash: {}', [
      tokenId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  nft.isFrozen = nftIsFrozen;
  nft.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

