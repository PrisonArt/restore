import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { NFTListComponent } from './nft-list/nft-list.component';
import { NFTListRoutingModule } from './nft-routing.module';
import { NFTComponent } from './nft/nft.component';
import { NFTMetadataComponent } from './nftmetadata/nftmetadata.component';

@NgModule({
  declarations: [NFTListComponent, NFTComponent, NFTMetadataComponent],
  imports: [CommonModule, SharedModule, NFTListRoutingModule]
})
export class NFTsModule {}
