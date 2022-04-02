import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  Restore,
  Approval,
  ApprovalForAll,
  ArtFrozen,
  ArtTransferred,
  OwnershipTransferred,
  ReadyForAuction,
  Transfer
} from '../generated/Restore/Restore'
import { Auction, NFT, Bid  } from '../generated/schema'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleArtFrozen(event: ArtFrozen): void {}

export function handleArtTransferred(event: ArtTransferred): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleReadyForAuction(event: ReadyForAuction): void {
  const tokenId = event.params.tokenId.toString();

  let nft = NFT.load(tokenId);
  if (nft == null) {
    nft = new NFT(tokenId);
  }

  nft.save();
}

export function handleTransfer(event: Transfer): void {}
