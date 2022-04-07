import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as SessionActions from '../nft.actions';

import { NFT } from '../nft.interface';

export interface State extends EntityState<NFT> {}

export const adapter: EntityAdapter<NFT> = createEntityAdapter<NFT>({
  selectId: (nft: NFT) => nft.id,
});

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(SessionActions.nftsLoadSuccess, (state, { nfts }) => adapter.addMany(nfts, state)),
  on(SessionActions.nftLoadSuccess, (state, { nft }) => adapter.upsertOne(nft, state)),
  on(SessionActions.nftLoadMetadataSuccess, (state, { nft }) => adapter.upsertOne(nft, state)),
);

export function nftReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
