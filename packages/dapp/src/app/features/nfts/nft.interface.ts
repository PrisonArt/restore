import BigNumber from 'bignumber.js';
/* eslint-disable @typescript-eslint/naming-convention */
export interface NFT {
  id: number;
  lfoDataHash: string;
  name: string;
  description: string;
  imageHash?: string;
  metadataHash: string;
  animationURL: string;
  attributes?: Attribute[];
  lfos: LFO[];
  external_url?: string;
  owner: string;
  isFrozen: boolean;
}

export interface NFTMetadata {
  id: number;
  name: string;
  description: string;
  imageHash: string;
  animationURL: string;
  attributes?: Attribute[];
  external_url?: string;
}

export interface LFOData {
  id: number;
  lfos: LFO[];
}

export interface Attribute {
  traitType: string;
  value: string;
}

export interface LFO {
  payee: string;
  paidDate: string;
  amountPaid: number;
  imageHash: string;
}

export interface Bid {
  id: string;
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
