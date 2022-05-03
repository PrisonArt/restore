import { createAction, props } from '@ngrx/store';

export const setNetworkName = createAction('[Wallet] Set Network Name',  props<{ networkName: string }>());
export const setAccountAddress = createAction('[Wallet] Set Account Address',  props<{ accountAddress: string }>());
export const setMinBidIncrementPercentage = createAction('[Wallet] Set Min Bid Increment Percentage',  props<{ minBidIncrementPercentage: number }>());
export const setReservePrice = createAction('[Wallet] Set Reserve Price',  props<{ reservePrice: string }>());
export const logoutUser = createAction('[Wallet] Logout Request');

export const loadUserBalance = createAction('[Wallet] Load User Balance', props<{ accountAddress: string }>());
export const loadUserBalanceSuccess = createAction('[Wallet] Set User Balance',
  props<{ userBalance: number }>());
export const loadUserBalanceFailure = createAction('[Wallet] Load User Balance Failure', props<{ errorMessage: string }>());

export const loadContractAllowance = createAction('[Wallet] Load Contract Allowance', props<{ accountAddress: string, contractAddress: string }>());
export const loadContractAllowanceSuccess = createAction('[Wallet] Set Contract Allowance',
  props<{ contractAllowance: number }>());
export const loadContractAllowanceFailure = createAction('[Wallet] Load Contract Allowance Failure', props<{ errorMessage: string }>());
