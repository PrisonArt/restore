import { NFTService } from './../../service/nft.service';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';

import {
  nftsLoad,
  nftsLoadSuccess,
  nftLoad,
  nftLoadSuccess,
  nftFailure,
  nftLoadMetadataSuccess
} from './nft.actions';


@Injectable()
export class NFTEffects {

  loadNFTs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoad),
      mergeMap(() =>
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
        this.nftService.getNFT(action.nftId).pipe(
          map(nft => nftLoadSuccess({ nft })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  loadNFTsMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoadSuccess),
      switchMap(action =>
        from(action.nfts).pipe(
          mergeMap((nft) =>
            this.nftService.getNFTMetadata(nft.id.toString(), nft.metadataHash).pipe(
              switchMap((nft) => [
                nftLoadMetadataSuccess({ nft })
              ]),
              catchError((error) => of(nftFailure({ error })))
            )
          )
      ))
    )
  );

  loadNFTMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoadSuccess),
      switchMap((action) =>
        this.nftService.getNFTMetadata(action.nft.id.toString(), action.nft.metadataHash).pipe(
          map(nft => nftLoadMetadataSuccess({ nft })),
          catchError((error) => of(nftFailure({ error })))
        )
      )
    )
  );

  constructor(
    private nftService: NFTService,
    private actions$: Actions,
  ) { }
}
