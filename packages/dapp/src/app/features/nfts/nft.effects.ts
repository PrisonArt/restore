import { NFTService } from './../../service/nft.service';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, from, of } from 'rxjs';
import {
  catchError,
  concatMap,
  exhaustMap,
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
  nftLoadMetadata,
  nftLoadMetadataSuccess
} from './nft.actions';

import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Injectable()
export class NFTEffects {

  loadNFTs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoad),
      mergeMap((nfts) =>
        this.nftService.getNFTs().pipe(
          map(nfts =>
            nftsLoadSuccess({nfts})
          ),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  loadNFT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoad),
      switchMap((action) =>
        this.nftService.getNFT(action.nft_id).pipe(
          map(nft => nftLoadSuccess({ nft })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );


  loadNFTsMetadata$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(nftsLoadSuccess),
      switchMap(action =>
        from(action.nfts).pipe(
          mergeMap((nft) => {
            return this.nftService.getNFTMetadata(nft.id.toString(), nft.metadataHash).pipe(
              switchMap((nft) => [
                nftLoadMetadataSuccess({ nft })
              ]),
              catchError((error) => of(nftFailure({ error })))
            );
          })
      ))
    );
  });

  loadNFTMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoadMetadata),
      switchMap((action) =>
        this.nftService.getNFTMetadata(action.nftId, action.metadataHash).pipe(
          map(nft => nftLoadMetadataSuccess({ nft })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  constructor(
    private nftService: NFTService,
    private store: Store,
    private actions$: Actions,
    private router: Router
  ) { }
}
