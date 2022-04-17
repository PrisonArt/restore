import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import Web3 from 'web3';

import { WalletService } from './../../service/wallet.service';

import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {
  loadCurrentContractAllowance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadContractAllowance),
      mergeMap((data) => {
        const loadDataValuesP$ = this.walletService.getJusticeContract().methods
          .allowance(data.accountAddress, data.contractAddress)
          .call();
        return from(loadDataValuesP$);
      }),
      map((result: any) => {
        const data = { contractAllowance: this.getNumber(result) };
        return WalletActions.loadContractAllowanceSuccess(data);
      }),
      catchError((error) => {
        console.log(error);
        return of(WalletActions.loadContractAllowanceFailure());
      })
    )
  );

  loadUserBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadUserBalance),
      mergeMap((data) => {
        const promise$ = this.walletService.getJusticeContract()
          .methods
          .balanceOf(data.accountAddress)
          .call();
        return from(promise$);
      }),
      map((result: any) => {
        const data = { userBalance: this.getNumber(result) };
        return WalletActions.loadUserBalanceSuccess(data);
      }),
      catchError((error) => {
        console.log(error);
        return of(WalletActions.loadUserBalanceFailure());
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.logoutUser),
      tap(_ => {
        this.walletService.clearProvider();
      })
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions,
    private store: Store,
    private walletService: WalletService) { }

  getNumber(value: string) {
    const fromWeiValue = Web3.utils.fromWei(value);
    const num = Number(fromWeiValue);
    return Math.round(num * 100) / 100;
  }

}
