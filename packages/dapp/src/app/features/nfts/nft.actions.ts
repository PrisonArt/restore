import { createAction, props } from '@ngrx/store';

import { NFT } from './nft.interface';

export const nftsLoad = createAction('[NFT/API] Load NFTs');
export const nftsLoadSuccess = createAction('[NFT/Command] Load NFTs Success', props<{ nfts: NFT[] }>());

export const nftLoad = createAction('[NFT/API] Load NFT', props<{ nft_id: string }>());
export const nftLoadSuccess = createAction('[NFT/Command] Load NFT Success', props<{ nft: NFT }>());

export const nftLoadMetadata = createAction('[NFT/API] Load NFT Metadata', props<{ nftId: string, metadataHash: string }>());
export const nftLoadMetadataSuccess = createAction('[NFT/Command] Load NFT Metadata Success', props<{ nft: NFT }>());

export const nftFailure = createAction('[NFT/API] NFT Failure', props<{ error: any }>());
