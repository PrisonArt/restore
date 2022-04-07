import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NFT } from '../features/nfts/nft.interface';

export interface NFTResponse {
	nfts: NFT[];
}

export const normalizeNFTDelete = (nftId: String, res: any): NFT => {
  const imageHash = res['image'].substring(5);
  return {
    id: Number(nftId),
    data: '',
    name: res['name'],
    tokenId: '',
    description: res['description'],
    imageHash: imageHash,
    owner: '',
    metadataHash: '',
    isFrozen: false
  }
};

export const normalizeNFT = (nft: any): NFT => {
  // trim the leading five characters of nft.metadataURI
  const metadataHash = nft.metadataURI.substring(5);

  return {
    id: Number(nft.id),
    data: nft.data,
    name: '',
    tokenId: nft.id,
    description: '',
    imageHash: '',
    owner: nft.owner.id,
    metadataHash: metadataHash,
    isFrozen: nft.isFrozen
  }
};

@Injectable({
  providedIn: 'root'
})
export class NFTService {

  // FIXME: use localhost, rinkeby, or mainnet url
  graphURL = 'http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost';


  nftGql = `
{
  nft(id: "0") {
    id
    metadataURI
    data
    isFrozen
    owner {
      id
    }
  }
}
`;

  nftsGql = `
{
  nfts {
    id
    metadataURI
    data
    isFrozen
    owner {
      id
    }
  }
  auctions {
    id
    startTime
    endTime
    settled
    amount
    saleSplit
    nft {
      id
    }
    winner {
      id
    }
    bidder {
      id
    }
    bids {
      id
      amount
      bidder
      blockNumber
      blockTimestamp
    }
    creator {
      id
    }
  }
}
`;

  constructor(private http: HttpClient) {
  }

  getNFT(nftId: string): Observable<NFT> {
    console.log(`# getNFT: ${nftId}`);
    // FIXME: incorporate nftId into the query
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftGql })
    .pipe(
      tap((res: any) => console.log(`generated text: ${res.data.nft}`)),
      map(res => res.data.nft),
      map(nft => normalizeNFT(nft))
    );
  }

  getNFTMetadata(nftId: string, metadataHash: string): Observable<NFT> {
    return this.http.get(`https://arweave.net/${metadataHash}`)
    .pipe(
      map(res => normalizeNFTDelete(nftId, res)),
    );
  }

  getNFTs(): Observable<NFT[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftsGql })
    .pipe(
      tap((res: any) => console.log(`# nfts: ${res.data.nfts.length}`)),
      map(res => res.data.nfts),
      map(nfts => nfts.map((nft: any) => normalizeNFT(nft)))
    );

  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    return throwError(error);
  }

}
