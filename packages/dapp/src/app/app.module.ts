import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NFTEffects } from './features/nfts/nft.effects';
import { nftReducers, auctionReducers, bidReducers } from './features/nfts/reducers';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { NotfoundComponent } from './app/notfound/notfound.component';

@NgModule({
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,

    // core
    CoreModule,

    // app
    AppRoutingModule,

    StoreModule.forFeature('nft', nftReducers),
    StoreModule.forFeature('auction', auctionReducers),
    StoreModule.forFeature('bid', bidReducers),
    EffectsModule.forFeature([NFTEffects])
  ],
  declarations: [AppComponent, NotfoundComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
