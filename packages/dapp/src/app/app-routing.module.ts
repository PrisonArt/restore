import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotfoundComponent } from './app/notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'nfts',
    pathMatch: 'full'
  },
  {
    path: 'nfts',
    loadChildren: () =>
      import('./features/nfts/nft.module').then(
        (m) => m.NFTsModule
      )
  },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: '/notfound' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
