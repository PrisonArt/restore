import { NFTService } from './../../service/nft.service';
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import {
  nftsLoad,
  nftsLoadSuccess,
  nftLoad,
  nftLoadSuccess,
  nftLoadMetadataSuccess,
  auctionsLoad,
  auctionsLoadSuccess,
  bidsLoad,
  bidsLoadSuccess,
  nftsLoadFailure,
  nftLoadFailure,
  nftLoadMetadataFailure,
  auctionsLoadFailure,
  bidsLoadFailure,
  auctionsLoadByNFT,
  auctionsLoadByNFTSuccess,
  auctionsLoadByNFTFailure,
  bidsLoadByNFT,
  bidsLoadByNFTSuccess,
  bidsLoadByNFTFailure,
  nftLoadLFODataSuccess,
  nftLoadLFODataFailure,
  bidLoadENSFailure,
  bidLoadENSSuccess
} from './nft.actions';
import { NotificationService } from 'app/core/notifications/notification.service';
import { WalletService } from 'app/service/wallet.service';

@Injectable()
export class NFTEffects {
  loadNFTs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoad),
      mergeMap(() =>
        this.nftService.getNFTs().pipe(
          tap(nfts => {
            if (nfts.length === 0) throw new Error('No NFTs found');
          }),
          map(nfts => nftsLoadSuccess({ nfts })),
          catchError(error => of(nftsLoadFailure({ error })))
        )
      )
    )
  );

  loadNFT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoad),
      switchMap(action =>
        this.nftService.getNFT(action.nftId).pipe(
          map(nft => nftLoadSuccess({ nft })),
          catchError(error => of(nftLoadFailure({ error })))
        )
      )
    )
  );

  loadNFTLFOData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoadSuccess),
      switchMap(action =>
        this.nftService
          .getLFOData(action.nft.id.toString(), action.nft.lfoDataHash)
          .pipe(
            map(lfoData => nftLoadLFODataSuccess({ lfoData })),
            catchError(error => of(nftLoadLFODataFailure({ error })))
          )
      )
    )
  );

  loadNFTsMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftsLoadSuccess),
      switchMap(action =>
        from(action.nfts).pipe(
          mergeMap(nft =>
            this.nftService
              .getNFTMetadata(nft.id.toString(), nft.metadataHash)
              .pipe(
                switchMap(nftMetadata => [
                  nftLoadMetadataSuccess({ nftMetadata })
                ]),
                catchError(error => of(nftLoadMetadataFailure({ error })))
              )
          )
        )
      )
    )
  );

  loadNFTMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(nftLoadSuccess),
      switchMap(action =>
        this.nftService
          .getNFTMetadata(action.nft.id.toString(), action.nft.metadataHash)
          .pipe(
            map(nftMetadata => nftLoadMetadataSuccess({ nftMetadata })),
            catchError(error => of(nftLoadMetadataFailure({ error })))
          )
      )
    )
  );

  loadAuctions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(auctionsLoad),
      switchMap(() =>
        this.nftService.getAuctions().pipe(
          map(auctions => auctionsLoadSuccess({ auctions })),
          catchError((error: any) => of(auctionsLoadFailure({ error })))
        )
      )
    )
  );

  loadAuctionByNFT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(auctionsLoadByNFT),
      switchMap(action =>
        this.nftService.getAuctionsByNFT(action.nftId).pipe(
          map(auctions => auctionsLoadByNFTSuccess({ auctions })),
          catchError(error => of(auctionsLoadByNFTFailure({ error })))
        )
      )
    )
  );

  loadBids$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bidsLoad),
      mergeMap(() =>
        this.nftService.getBids().pipe(
          map(bids => bidsLoadSuccess({ bids })),
          catchError(error => of(bidsLoadFailure({ error })))
        )
      )
    )
  );

  loadBidsByNFT$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bidsLoadByNFT),
      switchMap(action =>
        this.nftService.getBidsByNFT(action.nftId).pipe(
          map(bids => bidsLoadByNFTSuccess({ bids })),
          catchError(error => of(bidsLoadByNFTFailure({ error })))
        )
      )
    )
  );

  loadBidENS$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bidsLoadSuccess, bidsLoadByNFTSuccess),
      switchMap(action =>
        from(action.bids).pipe(
          mergeMap(bid =>
            this.walletService
              .getENS(bid.bidder)
              .pipe(
                switchMap(ens => {
                  if (ens === null) {
                    ens = bid.bidder;
                  }
                  return [bidLoadENSSuccess({ bidId: bid.id.toString(), bidderENS: ens })]
                }),
                catchError(error => of(bidLoadENSFailure({ error })))
              )
          )
        )
      )
    )
  );

  failure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          bidsLoadFailure,
          nftLoadFailure,
          nftLoadMetadataFailure,
          nftsLoadFailure,
          auctionsLoadFailure,
          auctionsLoadByNFTFailure,
          bidsLoadByNFTFailure,
          nftLoadLFODataFailure,
          bidLoadENSFailure,
        ),
        map(action => {
          this.notificationService.error(action.error.message);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private nftService: NFTService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private actions$: Actions
  ) {}
}
