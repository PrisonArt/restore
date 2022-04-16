import { createAction, props } from '@ngrx/store';

import { Auction, Bid, NFT } from './nft.interface';

export const nftsLoad = createAction('[NFT/API] Load NFTs');
export const nftsLoadSuccess = createAction('[NFT/Command] Load NFTs Success', props<{ nfts: NFT[] }>());

export const nftLoad = createAction('[NFT/API] Load NFT', props<{ nftId: string }>());
export const nftLoadSuccess = createAction('[NFT/Command] Load NFT Success', props<{ nft: NFT }>());

export const nftLoadMetadata = createAction('[NFT/API] Load NFT Metadata', props<{ nftId: string, metadataHash: string }>());
export const nftLoadMetadataSuccess = createAction('[NFT/Command] Load NFT Metadata Success', props<{ nft: NFT }>());

export const nftSelect = createAction('[View NFT Page] Select NFT', props<{ _id: number }>());

export const nftFailure = createAction('[NFT/API] NFT Failure', props<{ error: any }>());

export const auctionsLoad = createAction('[NFT/API] Load Auctions');
export const auctionsLoadSuccess = createAction('[NFT/Command] Load Auctions Success', props<{ auctions: Auction[] }>());

export const auctionLoad = createAction('[NFT/API] Load Auction', props<{ auctionId: string }>());
export const auctionLoadSuccess = createAction('[NFT/Command] Load Auction Success', props<{ auction: Auction }>());

export const bidsLoad = createAction('[NFT/API] Load Bids');
export const bidsLoadSuccess = createAction('[NFT/Command] Load Bids Success', props<{ bids: Bid[] }>());

export const bidLoad = createAction('[NFT/API] Load Bid', props<{ bidId: string }>());
export const bidLoadSuccess = createAction('[NFT/Command] Load Bid Success', props<{ bid: Bid }>());
