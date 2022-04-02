import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
  OwnershipTransferred,
} from '../generated/Justice/Justice'
import { Auction, NFT, Bid } from '../generated/schema'

export function handleAuctionBid(event: AuctionBid): void { }

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

export function handleAuctionExtended(event: AuctionExtended): void {}

export function handleAuctionSettled(event: AuctionSettled): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

