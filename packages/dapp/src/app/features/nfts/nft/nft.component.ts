import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { Auction, Bid, NFT } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';
import * as fromNFT from '../reducers/';
import * as NFTActions from '../nft.actions';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'pr1s0nart-app',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NFTComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  bids$: Observable<Bid[]>;
  bidDataSource: MatTableDataSource<Bid> = new MatTableDataSource();

  displayedColumns: string[] = ['bidder', 'amount', 'blockTimestamp'];
  id: number;
  sub: any;

  // FIXME get from contract
  minBidIncPercentage = new BigNumber(5).div(100).plus(1);

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  nft$: Observable<NFT>;
  nft: NFT;
  auctions$: Observable<Auction[]>;
  baseArweaveURL = 'https://arweave.net/';

  metadataUrl: string;
  openseaUrl: string;

  constructor(public route: ActivatedRoute,
    private store: Store,
    public nftService: NFTService,
    private notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'] as number;
    })

    this.store.dispatch(NFTActions.nftLoad({ nftId: this.id.toString() }));
    this.nft$ = this.store.pipe(select(fromNFT.selectNFT(this.id)));
    this.nft$.subscribe(data => {
      this.nft = data;
    });

    this.store.dispatch(NFTActions.auctionsLoad());
    this.auctions$ = this.store.pipe(select(fromNFT.selectAuctionsByNFT(this.id)));

    this.store.dispatch(NFTActions.bidsLoad());
    this.bids$ = this.store.pipe(select(fromNFT.selectBidsByNFT(this.id)));
    this.bids$.subscribe(data => {
      this.bidDataSource.data = data;
      this.bidDataSource.sort = this.sort;
    });

  }
}
