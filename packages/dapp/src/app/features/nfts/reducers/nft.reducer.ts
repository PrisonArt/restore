import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as NFTActions from '../nft.actions';

import { NFT } from '../nft.interface';

export type State = EntityState<NFT>;

export const adapter: EntityAdapter<NFT> = createEntityAdapter<NFT>({
  selectId: (nft: NFT) => nft.id,
});

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(NFTActions.nftsLoadSuccess, (state, { nfts }) => adapter.addMany(nfts, state)),
  on(NFTActions.nftLoadSuccess, (state, { nft }) => adapter.upsertOne(nft, state)),
  on(NFTActions.nftLoadMetadataSuccess, (state, { nftMetadata }) =>  adapter.updateOne({
    id: nftMetadata.id,
    changes: {
      name: nftMetadata.name,
      description: nftMetadata.description,
      imageHash: nftMetadata.imageHash,
      animationURL: nftMetadata.animationURL,
      attributes: nftMetadata.attributes
    }
  }, state)),
  on(NFTActions.nftLoadLFODataSuccess, (state, { lfoData }) =>  adapter.updateOne({
    id: lfoData.id,
    changes: {
      lfos: lfoData.lfos
    }
  }, state)),
);

export function nftReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
