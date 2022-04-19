import {
  createSelector,
  createFeatureSelector,
  combineReducers,
  Action,
} from '@ngrx/store';
import * as fromWallet from './wallet.reducer';

export interface WalletState {
  wallet: fromWallet.State; // entity
}

export function walletReducers(state: WalletState | undefined, action: Action) {
  return combineReducers({
    wallet: fromWallet.reducer,
  })(state, action);
}

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectNetworkName = createSelector(
  selectWalletState,
  (state) => state.wallet.networkName
);

export const selectMinBidIncPercentage = createSelector(
  selectWalletState,
  (state) => state.wallet.minBidIncrementPercentage
);

export const selectReservePrice = createSelector(
  selectWalletState,
  (state) => state.wallet.reservePrice
);

export const selectAccountAddress = createSelector(
  selectWalletState,
    (state) => state.wallet.accountAddress
);

export const selectAllowance = createSelector(
  selectWalletState,
  (state) => state.wallet.contractAllowance
);

export const selectUserBalance = createSelector(
  selectWalletState,
  (state) => state.wallet.userBalance
);
