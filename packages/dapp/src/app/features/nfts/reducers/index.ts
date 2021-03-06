import {
  createSelector,
  createFeatureSelector,
  combineReducers,
  Action,
} from '@ngrx/store';
import * as fromRoot from '../../../core/core.state';
import * as fromNFTs from './nft.reducer';
import * as fromAuctions from './auction.reducer';
import * as fromBids from './bid.reducer';

export interface State extends fromRoot.AppState {
  nft: NFTsState;
  auction: AuctionsState;
  bid: BidsState;
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
  createSelector(selectNFTEntities, (nfts) => nfts[id]);

// Auctions
export interface AuctionsState {
  auctions: fromAuctions.State; // entity
}

export function auctionReducers(state: AuctionsState | undefined, action: Action) {
  return combineReducers({
    auctions: fromAuctions.reducer,
  })(state, action);
}

export const selectAuctionsState = createFeatureSelector<AuctionsState>(
  'auction'
);

export const selectAuctionEntitiesState = createSelector(
  selectAuctionsState,
  (state) => state.auctions
);

export const {
  selectIds: selectAuctionIds,
  selectEntities: selectAuctionEntities,
  selectAll: selectAllAuctions,
  selectTotal: selectTotalAuctions
} = fromAuctions.adapter.getSelectors(selectAuctionEntitiesState);

export const selectAuction = (id: number) =>
  createSelector(selectAuctionEntities, (auctions) => auctions[id]);

export const selectAuctionByNFT = (nftId: number) => createSelector(
  selectAllAuctions,
 (auctions) => {
   if (nftId == null) {
     return null;
   }
   // FIXME: strict equality is not working
   const auctionsForNFT = auctions.filter(auction => auction.nftId == nftId)
   return auctionsForNFT[0];
  }
);

export const selectAuctionAmountByNFT = (nftId: number) => createSelector (
  selectAuctionByNFT(nftId),
  (auction) => {
    if (!auction) {
      return null;
    } else {
      return auction.amount
    }
  }
);

export const selectAuctionEndTimeByNFT = (nftId: number) => createSelector (
  selectAuctionByNFT(nftId),
  (auction) => {
    if (!auction) {
      return null;
    } else {
      return auction.endTime
    }
  }
);

// Bids
export interface BidsState {
  bids: fromBids.State; // entity
}

export function bidReducers(state: BidsState | undefined, action: Action) {
  return combineReducers({
    bids: fromBids.reducer,
  })(state, action);
}

export const selectBidsState = createFeatureSelector<BidsState>(
  'bid'
);

export const selectBidEntitiesState = createSelector(
  selectBidsState,
  (state) => state.bids
);

export const {
  selectIds: selectBidIds,
  selectEntities: selectBidEntities,
  selectAll: selectAllBids,
  selectTotal: selectTotalBids
} = fromBids.adapter.getSelectors(selectBidEntitiesState);

export const selectBid = (id: number) =>
  createSelector(selectBidEntities, (bids) => bids[id]);

export const selectBidsByNFT = (nftId: number) => createSelector(
  selectAllBids,
  (bids) => {
    if (nftId == null) {
      return bids;
    }
    // FIXME: strict equality is not working
    return bids.filter(bid => bid.nftId == nftId)
  }
);

