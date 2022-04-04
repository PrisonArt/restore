import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { NFT } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';

@Component({
  selector: 'pr1s0nart-app-neurapunk',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NFTComponent implements OnInit, OnDestroy {
  id: any;
  sub: any;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  nft: NFT;
  baseArweaveURL = 'https://arweave.net/';
  baseNPioUrl = '/neurapunks/metadata/';
  baseOpenseaUrl = 'https://opensea.io/assets/0xf46f332d20a05bb1d13b640f8138ba4dcc8d945c/';

  metadataUrl: string;
  openseaUrl: string;

  constructor(public route: ActivatedRoute,
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
    this.nftService.getNFT(this.id).subscribe(
      data => {
        this.nft = data;
        this.metadataUrl = this.nft.metadataHash ? `${this.baseArweaveURL}${this.nft.metadataHash}` :
          `${this.baseNPioUrl}${this.id}`;
        if (this.nft.tokenId) {
          this.openseaUrl = `${this.baseOpenseaUrl}${this.nft.tokenId}`
        }
      },
      error => {
        this.notificationService.error(error.message);
      }
    );
  }
}
