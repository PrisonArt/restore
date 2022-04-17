import BigNumber from 'bignumber.js';
/* eslint-disable @typescript-eslint/naming-convention */
export interface NFT {
  id: number;
  data: string;
  name: string;
  tokenId?: string;
  description: string;
  imageHash?: string;
  metadataHash: string;
  animationURL: string;
  attributes?: Attribute[];
  image?: string;
  external_url?: string;
  owner: string;
  isFrozen: boolean;
}

export interface Attribute {
  traitType: string;
  value: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  nftId: number;
  bidder: string;
  amount: BigNumber;
  blockTimestamp: BigNumber;
  blockNumber: number;
  txIndex: number;
}

export interface Auction {
  id: number;
  nftId: number;
  winnerId: string;
  bidderId: string;
  creatorId: string;
  amount: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
  settled: boolean;
}
