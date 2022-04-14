import { BigNumber } from 'ethers';
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
  bidder: string;
  amount: number;
}

export interface Auction {
  id: number;
  startTime: BigNumber;
}
