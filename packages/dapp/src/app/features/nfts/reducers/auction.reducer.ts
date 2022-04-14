import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as SessionActions from '../nft.actions';

import { Auction } from '../nft.interface';

export interface State extends EntityState<Auction> {}

export const adapter: EntityAdapter<Auction> = createEntityAdapter<Auction>({
  selectId: (auction: Auction) => auction.id,
});

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(SessionActions.auctionsLoadSuccess, (state, { auctions }) => adapter.addMany(auctions, state)),
  on(SessionActions.auctionLoadSuccess, (state, { auction }) => adapter.upsertOne(auction, state)),
);

export function auctionReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
