import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { NFT } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';
import * as fromNFT from '../reducers/';
import * as NFTActions from '../nft.actions';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'pr1s0nart-app',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NFTComponent implements OnInit, OnDestroy {
  id: any;
  sub: any;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  nft$: Observable<NFT>;
  nft: NFT;
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
      this.id = params['id'];
    })
    this.store.dispatch(NFTActions.nftLoad({ nft_id: this.id }));
    this.nft$ = this.store.pipe(select(fromNFT.selectNFT(this.id)));
    this.nft$.subscribe(data => {
      this.nft = data;
    });
  }
}
