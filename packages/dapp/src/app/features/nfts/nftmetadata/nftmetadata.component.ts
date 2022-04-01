import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_ANIMATIONS_ELEMENTS, NotificationService } from '../../../core/core.module';

import { NFT } from '../nft.interface';
import { NFTService } from 'app/service/nft.service';

@Component({
  selector: 'app-npmetadata',
  templateUrl: './nftmetadata.component.html',
  styleUrls: ['./nftmetadata.component.scss']
})
export class NFTMetadataComponent implements OnInit, OnDestroy {
  id: any;
  sub: any;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  nft: NFT;
  nftJson: string;

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
    this.nftService.getNFTMetadata(this.id).subscribe(
      data => {
        this.nft = data;
        this.nftJson = JSON.stringify(this.nft, null, 4);
      },
      error => {
        this.notificationService.error(error.message);
      }
    );
  }
}
