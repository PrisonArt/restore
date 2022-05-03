import { Action, createReducer, on } from '@ngrx/store';
import * as WalletActions from '../wallet.actions';

export const walletFeatureKey = 'wallet';

export interface State {
  networkName: string;
  minBidIncrementPercentage: number;
  reservePrice: string;
  accountAddress: string;
  contractAllowance: number;
  userBalance: number;
}

export const initialState: State = {
  networkName: '',
  minBidIncrementPercentage: 0,
  reservePrice: '0',
  accountAddress: '',
  contractAllowance: 0,
  userBalance: 0
};

export const reducer = createReducer(
  initialState,
  on(WalletActions.setAccountAddress, (state, { accountAddress }) => ({ ...state, accountAddress })),
  on(WalletActions.setNetworkName, (state, { networkName }) => ({ ...state, networkName })),
  on(WalletActions.setReservePrice, (state, { reservePrice }) => ({ ...state, reservePrice })),
  on(WalletActions.setMinBidIncrementPercentage, (state, { minBidIncrementPercentage }) => ({ ...state, minBidIncrementPercentage })),
  on(WalletActions.logoutUser, (state) => ({...initialState})),
  on(WalletActions.loadContractAllowanceSuccess, (state, { contractAllowance }) =>
    ({ ...state, contractAllowance })
  ),
  on(WalletActions.loadUserBalanceSuccess, (state, { userBalance }) =>
    ({ ...state, userBalance })
  ),
);

export function walletReducer(state: State | undefined, action: Action) {
  return reducer(state, action);
}
