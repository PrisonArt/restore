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

export const getWalletState = createFeatureSelector<WalletState>('wallet');

export const getAccountAddress = createSelector(
    getWalletState,
    (state) => state.wallet.accountAddress
);

export const getAccountAddressShortened = createSelector(
    getAccountAddress,
    (address) => (!address)
          ? address
          : address.substring(0, 5) + '...' + address.substring(address.length - 3)
);

export const getAllowance = createSelector(
  getWalletState,
  (state) => state.wallet.contractAllowance
);

export const getUserBalance = createSelector(
  getWalletState,
  (state) => state.wallet.userBalance
);
