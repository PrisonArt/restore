import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as AuctionActions from '../nft.actions';

import { Auction } from '../nft.interface';

export type State = EntityState<Auction>;

export const adapter: EntityAdapter<Auction> = createEntityAdapter<Auction>({
  selectId: (auction: Auction) => auction.id,
});

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(AuctionActions.auctionsLoadSuccess, (state, { auctions }) => adapter.addMany(auctions, state)),
  on(AuctionActions.auctionLoadByNFTSuccess, (state, { auction }) => adapter.upsertOne(auction, state)),
);

export function auctionReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
