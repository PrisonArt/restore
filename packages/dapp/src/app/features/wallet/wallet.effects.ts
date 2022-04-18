import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import { NotificationService } from 'app/core/notifications/notification.service';
import { WalletService } from './../../service/wallet.service';

import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {
  loadUserBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadUserBalance),
      mergeMap((action) =>
        this.walletService.getBalanceOf(action.accountAddress).pipe(
          map((balance) => {
            return WalletActions.loadUserBalanceSuccess({userBalance: balance.toNumber()})
          }),
          catchError((error) =>
            of(WalletActions.loadUserBalanceFailure(error))
          )
        )
      )
    )
  );

  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadUserBalanceFailure, WalletActions.loadContractAllowanceFailure),
      tap((action) => { this.notificationService.error(action.errorMessage) })
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
    private walletService: WalletService,
    private notificationService: NotificationService) { }

}
