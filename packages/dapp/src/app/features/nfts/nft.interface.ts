/* eslint-disable @typescript-eslint/naming-convention */
export interface NFT {
  id: number;
  name: string;
  tokenId?: string;
  description: string;
  imageHash: string;
  metadataHash?: string;
  attributes?: Attribute[];
  image?: string;
  external_url?: string;
}

export interface Attribute {
  trait_type: string;
  value: string;
}
