import { createAction, props } from '@ngrx/store';

import { Auction, Bid, NFT, NFTMetadata } from './nft.interface';

export const nftsLoad = createAction('[NFT] Load NFTs');
export const nftsLoadSuccess = createAction('[NFT] Load NFTs Success', props<{ nfts: NFT[] }>());
export const nftsLoadFailure = createAction('[NFT] Load NFTs Failure', props<{ error: any }>());

export const nftLoad = createAction('[NFT] Load NFT', props<{ nftId: string }>());
export const nftLoadSuccess = createAction('[NFT] Load NFT Success', props<{ nft: NFT }>());
export const nftLoadFailure = createAction('[NFT] Load NFT Failure', props<{ error: any }>());

export const nftLoadMetadata = createAction('[NFT] Load NFT Metadata', props<{ nftId: string, metadataHash: string }>());
export const nftLoadMetadataSuccess = createAction('[NFT] Load NFT Metadata Success', props<{ nftMetadata: NFTMetadata }>());
export const nftLoadMetadataFailure = createAction('[NFT] Load NFT Metadata Failure', props<{ error: any }>());

export const nftSelect = createAction('[View NFT Page] Select NFT', props<{ _id: number }>());

export const auctionsLoad = createAction('[NFT] Load Auctions');
export const auctionsLoadSuccess = createAction('[NFT] Load Auctions Success', props<{ auctions: Auction[] }>());
export const auctionsLoadFailure = createAction('[NFT] Load Auctions Failure', props<{ error: Error }>());

export const auctionsLoadByNFT = createAction('[NFT] Load Auctions By NFT', props<{ nftId: string }>());
export const auctionsLoadByNFTSuccess = createAction('[NFT] Load Auctions By NFT Success', props<{ auctions: Auction[] }>());
export const auctionsLoadByNFTFailure = createAction('[NFT] Load Auctions By NFT Failure', props<{ error: any }>());

export const bidsLoad = createAction('[NFT] Load Bids');
export const bidsLoadSuccess = createAction('[NFT] Load Bids Success', props<{ bids: Bid[] }>());
export const bidsLoadFailure = createAction('[NFT] Load Bids Failure', props<{ error: any }>());

export const bidsLoadByNFT = createAction('[NFT] Load Bids By NFT', props<{ nftId: string }>());
export const bidsLoadByNFTSuccess = createAction('[NFT] Load Bids By NFT Success', props<{ bids: Bid[] }>());
export const bidsLoadByNFTFailure = createAction('[NFT] Load Bids By NFT Failure', props<{ error: any }>());

export const bidLoad = createAction('[NFT] Load Bid', props<{ bidId: string }>());
export const bidLoadSuccess = createAction('[NFT] Load Bid Success', props<{ bid: Bid }>());
export const bidLoadFailure = createAction('[NFT] Load Bid Failure', props<{ error: any }>());

export const initializeConnection = createAction('[WebSocket] Initialize connection');
export const initializeConnectionSuccess = createAction('[WebSocket] Initialize connection Success');

export const startNotifications = createAction('[WebSocket] Start Notifications');
export const stopNotifications = createAction('[WebSocket] Stop Notifications');
export const newNotification = createAction('[WebSocket] New Notification');
export const sentNotification = createAction('[WebSocket] Sent Notification');
