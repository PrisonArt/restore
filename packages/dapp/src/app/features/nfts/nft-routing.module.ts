import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NFTComponent } from './nft/nft.component';
import { NFTMetadataComponent } from './nftmetadata/nftmetadata.component';
import { NFTListComponent } from './nft-list/nft-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        component: NFTComponent,
        data: { title: 'pr1s0nart.menu.nft' }
      },
      {
        path: 'metadata/:id',
        component: NFTComponent,
        data: { title: 'pr1s0nart.menu.nft' }
      },
      {
        path: '',
        component: NFTListComponent,
        data: { title: 'pr1s0nart.menu.nfts' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NFTListRoutingModule { }
