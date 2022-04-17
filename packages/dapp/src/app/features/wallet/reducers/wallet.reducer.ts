import { Action, createReducer, on } from '@ngrx/store';
import * as WalletActions from '../wallet.actions';

export const walletFeatureKey = 'wallet';

export interface State {
  accountAddress: string | null;
  contractAllowance: number | null;
  userBalance: number | null;
}

export const initialState: State = {
  accountAddress: null,
  contractAllowance: null,
  userBalance: null
};

export const reducer = createReducer(
  initialState,
  on(WalletActions.setAccountAddress, (state, { accountAddress }) => ({ ...state, accountAddress })),
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
