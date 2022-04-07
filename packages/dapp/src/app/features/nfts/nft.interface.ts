/* eslint-disable @typescript-eslint/naming-convention */
export interface NFT {
  id: number;
  data: string;
  name: string;
  tokenId?: string;
  description: string;
  imageHash?: string;
  metadataHash: string;
  attributes?: Attribute[];
  image?: string;
  external_url?: string;
  owner: string;
  isFrozen: boolean;
}

export interface Attribute {
  trait_type: string;
  value: string;
}
