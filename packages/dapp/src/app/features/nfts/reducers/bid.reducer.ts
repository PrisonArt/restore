import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, combineReducers, createReducer, on } from '@ngrx/store';
import * as BidActions from '../nft.actions';

import { Bid } from '../nft.interface';

export type State = EntityState<Bid>;

export const adapter: EntityAdapter<Bid> = createEntityAdapter<Bid>({
  selectId: (bid: Bid) => bid.id,
});

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(BidActions.bidsLoadSuccess, (state, { bids }) => adapter.addMany(bids, state)),
  on(BidActions.bidsLoadByNFTSuccess, (state, { bids }) => adapter.upsertMany(bids, state)),
  on(BidActions.bidLoadSuccess, (state, { bid }) => adapter.upsertOne(bid, state)),
);

export function bidReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
