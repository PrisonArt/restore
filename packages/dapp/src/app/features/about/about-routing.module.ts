import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent,
    data: { title: 'pr1s0nart.menu.about' }
  },
  {
    path: 'nfts',
    loadChildren: () =>
      import('../nfts/nft.module').then(
        (m) => m.NFTsModule
      )
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutRoutingModule {}
