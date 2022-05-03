import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { NFT, Attribute, Auction } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';
import * as fromNFT from '../reducers/';
import * as NFTActions from '../nft.actions';

@Component({
  selector: 'pr1s0nart-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NFTListComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<NFT> = new MatTableDataSource();
  nfts$: Observable<NFT[]>;
  auctions$: Observable<Auction[]>;
  obs$: Observable<any>;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private store: Store,
    public nftService: NFTService,
    private notificationService: NotificationService) {
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();

    this.store.dispatch(NFTActions.nftsLoad());
    this.nfts$ = this.store.pipe(select(fromNFT.selectAllNFTs));
    this.nfts$.subscribe(data => {
      const sorted = data.sort((a, b) =>
        b.id - a.id
      );

      this.dataSource.data = sorted;

      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (nft: NFT, filter: string): boolean =>
        nft.id.toString().includes(filter)
        || nft.name.toLowerCase().includes(filter)
        || nft.description.toLowerCase().includes(filter)
        || filterAttributes(nft.attributes, filter);
    });
    this.obs$ = this.dataSource.connect();
    this.store.dispatch(NFTActions.auctionsLoad());
    this.auctions$ = this.store.pipe(select(fromNFT.selectAllAuctions));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

function filterAttributes(attributes: Attribute[] | undefined, filter: string): boolean {
  const result = attributes?.find(({ value }) => value.toLocaleLowerCase().includes(filter));
  return result !== undefined;
}

