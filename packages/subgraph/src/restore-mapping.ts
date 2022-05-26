import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  Restore,
  Approval,
  ApprovalForAll,
  ArtFrozen,
  ArtTransferred,
  OwnershipTransferred,
  ReadyForAuction,
  Transfer,
} from '../generated/Restore/Restore';
import { Account, NFT } from '../generated/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleArtFrozen(event: ArtFrozen): void {
  const buyer = event.params.buyer.toHexString();
  const tokenId = event.params.tokenId.toString();

  const buyerAccount: Account = getOrCreateAccount(buyer);

  let nft = NFT.load(tokenId);
  if (nft == null) {
    nft = new NFT(tokenId);
  }
  nft.isFrozen = true;
  nft.owner = buyerAccount.id;
  nft.save();

  buyerAccount.save();
}

export function handleArtTransferred(event: ArtTransferred): void {
  const buyer = event.params.buyer.toHexString();
  const tokenId = event.params.tokenId.toString();
  const data = event.params.data;

  const buyerAccount = getOrCreateAccount(buyer);

  let nft = NFT.load(tokenId);
  if (nft == null) {
    nft = new NFT(tokenId);
  }
  nft.data = data;
  nft.owner = buyerAccount.id;
  nft.isFrozen = false;
  nft.transferTx = event.transaction.hash.toHex();
  nft.save();

  buyerAccount.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleReadyForAuction(event: ReadyForAuction): void {
  const tokenId = event.params.tokenId.toString();
  const metadataURI = event.params.uri.toString();
  const creator = event.params.to.toHexString();

  let nft = NFT.load(tokenId);
  if (nft == null) {
    nft = new NFT(tokenId);
    nft.isFrozen = false;
    nft.metadataURI = metadataURI;
    nft.createdAtTimestamp = event.block.timestamp;

    const account = getOrCreateAccount(creator);
    nft.owner = account.id;
  }

  nft.save();
}

export function handleTransfer(event: Transfer): void {}
