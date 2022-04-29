import { NFTService } from './../../service/nft.service';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';

import {
  nftsLoad,
  nftsLoadSuccess,
  nftLoad,
  nftLoadSuccess,
  nftFailure,
  nftLoadMetadataSuccess,
  auctionsLoad,
  auctionsLoadSuccess,
  bidsLoad,
  bidsLoadSuccess
} from './nft.actions';
import { NotificationService } from 'app/core/notifications/notification.service';


@Injectable()
export class NFTEffects {
  loadNFTs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoad),
      mergeMap(() =>
        this.nftService.getNFTs().pipe(
          map((nfts) => nftsLoadSuccess({ nfts })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  loadNFT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoad),
      switchMap((action) =>
        this.nftService.getNFT(action.nftId).pipe(
          map((nft) => nftLoadSuccess({ nft })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  loadNFTsMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoadSuccess),
      switchMap((action) =>
        from(action.nfts).pipe(
          mergeMap((nft) =>
            this.nftService
              .getNFTMetadata(nft.id.toString(), nft.metadataHash)
              .pipe(
                switchMap((nftMetadata) => [nftLoadMetadataSuccess({ nftMetadata })]),
                catchError((error) => of(nftFailure({ error })))
              )
          )
        )
      )
    )
  );

  loadNFTMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoadSuccess),
      switchMap((action) =>
        this.nftService
          .getNFTMetadata(action.nft.id.toString(), action.nft.metadataHash)
          .pipe(
            map((nftMetadata) => nftLoadMetadataSuccess({ nftMetadata })),
            catchError((error) => of(nftFailure({ error })))
          )
      )
    )
  );

  loadAuctions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(auctionsLoad),
      mergeMap(() =>
        this.nftService.getAuctions().pipe(
          map((auctions) => auctionsLoadSuccess({ auctions })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  loadBids$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bidsLoad),
      mergeMap(() =>
        this.nftService.getBids().pipe(
          map((bids) => bidsLoadSuccess({ bids })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftFailure),
      tap((action) => { this.notificationService.error(action.error) })
    ),
    { dispatch: false }
  );

  constructor(private nftService: NFTService, private notificationService: NotificationService, private actions$: Actions) {}
}
