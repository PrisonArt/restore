import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { NFT, Attribute } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';
import * as fromNFT from '../reducers/';
import * as NFTActions from '../nft.actions';

@Component({
  selector: 'pr1s0nart-neurapunk-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NFTListComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<NFT> = new MatTableDataSource();
  nfts$: Observable<NFT[]>;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  baseArweaveURL = 'https://arweave.net/';
  baseOpenseaUrl = 'https://opensea.io/assets/0xf46f332d20a05bb1d13b640f8138ba4dcc8d945c/';


  constructor(private changeDetectorRef: ChangeDetectorRef,
    private store: Store,
    public nftService: NFTService,
    private notificationService: NotificationService) {
  }


  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.store.dispatch(NFTActions.nftsLoad());
    this.nfts$ = this.store.pipe(select(fromNFT.selectAllNFTs));
    this.nfts$.subscribe(data => {
      this.dataSource.data = data;
    });

    this.dataSource.filterPredicate = (np: NFT, filter: string): boolean =>
      np.name.toLowerCase().includes(filter)
      || np.description.toLowerCase().includes(filter)
      || filterAttributes(np.attributes, filter);
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

