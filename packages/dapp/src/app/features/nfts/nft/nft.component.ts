import { DateInPastPipe } from './../../../app/pipes/dayinpast.pipe';
import { WalletService } from './../../../service/wallet.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { Auction, Bid, NFT } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';
import * as fromNFT from '../reducers/';
import * as fromWallet from '../../wallet/reducers/';
import * as NFTActions from '../nft.actions';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription, takeWhile, timer } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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

  idSub: Subscription;
  minBidSub: Subscription;
  reservePriceSub: Subscription;
  bidsSub: Subscription;
  accountAddressSub: Subscription;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

  formGroup: FormGroup;
  numberRegEx = /\-?\d*\.?\d{1,2}/;

  minBidIncPercentage$: Observable<number>;
  minBidIncPercentage: number;
  reservePrice$: Observable<number>;
  reservePrice: number;
  accountAddress$: Observable<string>;
  accountAddress: string;

  nft$: Observable<NFT | undefined>;
  nft: NFT | undefined;
  auction$: Observable<Auction | null>;
  auctionAmount$: Observable<BigNumber | null>;
  auctionEndTime$: Observable<BigNumber | null>;
  countDown$: Observable<number>;
  minBid: number;

  metadataUrl: string;
  openseaUrl: string;

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private store: Store,
    public nftService: NFTService,
    public walletService: WalletService,
    private notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    // avoid memory leaks here by unsubscribing
    this.idSub.unsubscribe();
    this.minBidSub.unsubscribe();
    this.reservePriceSub.unsubscribe();
    this.bidsSub.unsubscribe();
  }

  ngOnInit(): void {
    this.idSub = this.route.params.subscribe(params => {
      this.id = params['id'] as number;
    })

    this.store.dispatch(NFTActions.nftLoad({ nftId: this.id.toString() }));
    this.nft$ = this.store.pipe(select(fromNFT.selectNFT(this.id)));

    this.store.dispatch(NFTActions.auctionLoadByNFT({ nftId: this.id.toString() }));
    this.auction$ = this.store.pipe(select(fromNFT.selectAuctionByNFT(this.id)));
    this.auctionAmount$ = this.store.pipe(select(fromNFT.selectAuctionAmountByNFT(this.id)));
    this.auctionEndTime$ = this.store.pipe(select(fromNFT.selectAuctionEndTimeByNFT(this.id)));
    this.auctionEndTime$.subscribe(endTime => {
      if (endTime) {
        timer(0, 1000).pipe(
          takeWhile(i => !(new DateInPastPipe().transform(endTime)))
        ).subscribe(timerValue => {
          // console.log(timerValue)
        });
      }
    });

    this.minBidIncPercentage$ = this.store.pipe(select(fromWallet.selectMinBidIncPercentage));
    this.minBidSub = this.minBidIncPercentage$.subscribe(data => {
      this.minBidIncPercentage = data;
    });

    this.reservePrice$ = this.store.pipe(select(fromWallet.selectReservePrice));
    this.reservePriceSub = this.reservePrice$.subscribe(data => {
      const reservePrice = utils.formatEther(data);
      this.reservePrice = new BigNumber(reservePrice).toNumber();
    });

    this.accountAddress$ = this.store.pipe(select(fromWallet.selectAccountAddress));
    this.accountAddressSub = this.accountAddress$.subscribe(data => {
      this.accountAddress = data;
    });

    this.minBidSub = combineLatest([this.auctionAmount$, this.minBidIncPercentage$, this.reservePrice$]).subscribe(([auctionAmount, , ]) => {
      let minBid = 0;
      const minBidIncPercentageDec = new BigNumber(this.minBidIncPercentage).div(100).plus(1);
      if (auctionAmount) {
        if (new BigNumber(auctionAmount).toNumber() === 0) {
          // FIXME: set this to the actual reserve price
          minBid = 100000000000000000;// this.reservePrice;
        } else {
          console.log("minBid updated");
          minBid = minBidIncPercentageDec.times(auctionAmount).toNumber();
        }
      }
      // format the min bid into Ether and create a number
      const minBidEther = utils.formatEther(new BigNumber(minBid).toString());
      this.minBid = parseFloat(minBidEther);
    });

    this.store.dispatch(NFTActions.bidsLoadByNFT({ nftId: this.id.toString() }));
    this.bids$ = this.store.pipe(select(fromNFT.selectBidsByNFT(this.id)));
    this.bidsSub = this.bids$.subscribe(data => {
      this.bidDataSource.data = data;
      this.bidDataSource.sort = this.sort;
    });

    this.formGroup = this.formBuilder.group({
      amount: [this.minBid, [Validators.required, Validators.pattern(this.numberRegEx), this.minEthValidator()]],
    })
  }

  minEthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const bidLessThanMin = control.value < this.minBid;
      return bidLessThanMin ? {min: {value: control.value}} : null;
    };
  }

  createBid() {
    const { fileArg, ...model } = this.formGroup.value;
    this.walletService.bid(this.id, model.amount);
  }
}
