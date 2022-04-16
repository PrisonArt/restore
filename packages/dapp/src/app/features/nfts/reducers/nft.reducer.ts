import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as NFTActions from '../nft.actions';

import { NFT } from '../nft.interface';

export interface State extends EntityState<NFT> {
  selectedNFTid: number | null;
}

export const adapter: EntityAdapter<NFT> = createEntityAdapter<NFT>({
  selectId: (nft: NFT) => nft.id,
});

export const initialState: State = adapter.getInitialState({
  selectedNFTid: null,
});

export const reducer = createReducer(
  initialState,
  on(NFTActions.nftsLoadSuccess, (state, { nfts }) => adapter.addMany(nfts, state)),
  on(NFTActions.nftLoadSuccess, (state, { nft }) => adapter.upsertOne(nft, state)),
  on(NFTActions.nftLoadMetadataSuccess, (state, { nft }) => adapter.upsertOne(nft, state)),
  on(NFTActions.nftSelect, (state, { _id }) => ({
    ...state,
    selectedNFTid: _id,
  })),
);

export function nftReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
