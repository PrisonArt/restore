import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NFT } from '../features/nfts/nft.interface';

export interface NFTResponse {
	nfts: NFT[];
}

export const normalizeNFT = (nft: any): NFT => ({
  id: Number(nft.id),
  name: '',
  description: '',
  imageHash: '',
});

@Injectable({
  providedIn: 'root'
})
export class NFTService {

  // FIXME: update to use "prisonart" subgraph link
  graphURL = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph-rinkeby-v4';

  // FIXME: update "nouns" query to use "prisonart" subgraph value
  nftsGql = `
{
  nouns {
    id
  }
}
`;

  constructor(private http: HttpClient) {
  }

  getNFT(nftId: string): Observable<NFT> {
    // FIXME: incorporate nftId into the query
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftsGql })
    .pipe(
      // FIXME: update nouns to nfts
      tap((res: any) => console.log(`generated text: ${res.data.nouns}`)),
      map(res => res.data.nouns[0]),
      map(nft => normalizeNFT(nft))
    );
  }

  getNFTMetadata(nftId: string): Observable<NFT> {

    // FIXME: incorporate nftId into the query
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftsGql })
    .pipe(
      // FIXME: update nouns to nfts
      tap((res: any) => console.log(`generated text: ${res.data.nouns}`)),
      map(res => res.data.nouns[0]),
      map(nft => normalizeNFT(nft))
    );
  }

  getNFTs(): Observable<NFT[]> {

    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftsGql })
    .pipe(
      // FIXME: update nouns to nfts
      tap((res: any) => console.log(`generated text: ${res.data.nouns}`)),
      map(res => res.data.nouns),
      map(nfts => nfts.map((nft: any) => normalizeNFT(nft)))
    );

  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    return throwError(error);
  }

}
