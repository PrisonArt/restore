import { createAction, props } from '@ngrx/store';

export const setAccountAddress = createAction('[Wallet] Set Account Address',  props<{ accountAddress: string }>());
export const logoutUser = createAction('[Wallet] Logout Request');

export const loadUserBalance = createAction('[Wallet] Load User Balance', props<{ accountAddress: string }>());
export const loadUserBalanceSuccess = createAction('[Wallet] Set User Balance',
  props<{ userBalance: number }>());
export const loadUserBalanceFailure = createAction('[Wallet] Load User Balance Failure');

export const loadContractAllowance = createAction('[Wallet] Load Contract Allowance', props<{ accountAddress: string, contractAddress: string }>());
export const loadContractAllowanceSuccess = createAction('[Wallet] Set Contract Allowance',
  props<{ contractAllowance: number }>());
export const loadContractAllowanceFailure = createAction('[Wallet] Load Contract Allowance Failure');
