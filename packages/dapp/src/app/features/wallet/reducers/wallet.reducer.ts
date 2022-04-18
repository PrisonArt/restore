import { Action, createReducer, on } from '@ngrx/store';
import * as WalletActions from '../wallet.actions';

export const walletFeatureKey = 'wallet';

export interface State {
  networkName: string;
  accountAddress: string;
  contractAllowance: number;
  userBalance: number;
}

export const initialState: State = {
  networkName: '',
  accountAddress: '',
  contractAllowance: 0,
  userBalance: 0
};

export const reducer = createReducer(
  initialState,
  on(WalletActions.setAccountAddress, (state, { accountAddress }) => ({ ...state, accountAddress })),
  on(WalletActions.setNetworkName, (state, { networkName }) => ({ ...state, networkName })),
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
