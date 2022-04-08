import {
  createSelector,
  createFeatureSelector,
  combineReducers,
  Action,
} from '@ngrx/store';
import * as fromRoot from '../../../core/core.state';
import * as fromNFTs from './nft.reducer';

export interface State extends fromRoot.AppState {
  nft: NFTsState;
}

export interface NFTsState {
  nfts: fromNFTs.State; // entity
}

export function nftReducers(state: NFTsState | undefined, action: Action) {
  return combineReducers({
    nfts: fromNFTs.reducer,
  })(state, action);
}

export const selectNFTsState = createFeatureSelector<NFTsState>(
  'nft'
);

export const selectNFTEntitiesState = createSelector(
  selectNFTsState,
  (state) => state.nfts
);

export const {
  selectIds: selectNFTIds,
  selectEntities: selectNFTEntities,
  selectAll: selectAllNFTs,
  selectTotal: selectTotalNFTs
} = fromNFTs.adapter.getSelectors(selectNFTEntitiesState);

export const selectNFT = (id: number) =>
  createSelector(selectAllNFTs, (nfts) => nfts[id]);

