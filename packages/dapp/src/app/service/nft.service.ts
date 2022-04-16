import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Attribute, Auction, Bid, NFT } from '../features/nfts/nft.interface';

export interface NFTResponse {
	nfts: NFT[];
  auctions: Auction[];
}

// FIXME: populate a NFTMetadata object and update the reducer function to update just the metadata values
export const normalizeNFTDelete = (nftId: String, res: any): NFT => {
  const attributes: Attribute[] = res['attributes'].map(
    (attribute: { [x: string]: any }) => (
      {
        traitType: attribute['trait_type'],
        value: attribute['value'],
      }
    )
  );

  const imageHash = res['image'].substring(5);
  // FIXME: The standard Arweave URL redirects to a arweave subdomain, causing a CORS error
  // const animationURL = res['animation_url'].substring(5);
  const animationURL = 'https://2sbpw3pbmyuzng3pnenk7tr4s4mpnin7e2i2am2twdv6alzj.arweave.net/1IL7beFmKZabb2k-ar848lxj2ob8mkaAzU7_Dr4C8p0'
  console.log('animationURL:', animationURL);
  return {
    id: Number(nftId),
    data: '',
    name: res['name'],
    tokenId: '',
    description: res['description'],
    imageHash: imageHash,
    animationURL: animationURL,
    owner: '',
    metadataHash: '',
    isFrozen: false,
    attributes: attributes
  }
};

export const normalizeNFT = (nft: any): NFT => {
  console.log('normalizeNFT:', nft);

  // trim the leading five characters of nft.metadataURI
  const metadataHash = nft.metadataURI.substring(5);

  return {
    id: Number(nft.id),
    data: nft.data,
    name: '',
    tokenId: nft.id,
    description: '',
    imageHash: '',
    animationURL: '',
    owner: nft.owner.id,
    metadataHash: metadataHash,
    isFrozen: nft.isFrozen
  }
};

export const normalizeAuction = (auction: any): Auction => (
  {
    id: Number(auction.id),
    amount: auction.amount,
    startTime: auction.startTime,
    endTime: auction.endTime,
    settled: auction.settled
  }
);

export const normalizeBid = (bid: any): Bid => (
  {
    id: Number(bid.id),
    bidder: bid.bidder.id,
    amount: bid.amount,
    blockTimestamp: bid.blockTimestamp,
  }
);

@Injectable({
  providedIn: 'root'
})
export class NFTService {

  // FIXME: use localhost, rinkeby, or mainnet url
  graphURL = 'http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost';

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
}
`;

auctionsGql = `
{
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
    creator {
      id
    }
  }
}
`;

bidsGql = `
{
  bids {
    id
    amount
    blockNumber
    blockTimestamp
    txIndex
    bidder {
      id
    }
    nft {
      id
    }
  }
}
`;

constructor(private http: HttpClient) {
}

nftGql = (nftId: string) => `
{
  nft(id: "${nftId}") {
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

bidsByAuctionGql = (auctionId: string) => `
{
  bids(auction: "${auctionId}") {
    id
    amount
    blockNumber
    blockTimestamp
    txIndex
    bidder {
      id
    }
    nft {
      id
    }
  }
}
 `;

  getNFT(nftId: string): Observable<NFT> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftGql(nftId.toString())})
    .pipe(
      tap((res: any) => console.log(`nft: ${res.data.nft.id}`)),
      map(res => res.data.nft),
      map(nft => normalizeNFT(nft))
    );
  }

  getNFTMetadata(nftId: string, metadataHash: string): Observable<NFT> {
    return this.http.get(`https://arweave.net/${metadataHash}.json`)
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

  getAuctions(): Observable<Auction[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.auctionsGql })
    .pipe(
      tap((res: any) => console.log(`# auctions: ${res.data.auctions.length}`)),
      map(res => res.data.auctions),
      map(auctions => auctions.map((auction: any) => normalizeAuction(auction)))
    );
  }

  getBids(): Observable<Bid[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.bidsGql })
    .pipe(
      tap((res: any) => console.log(`# bids: ${res.data.bids.length}`)),
      map(res => res.data.bids),
      map(bids => bids.map((bid: any) => normalizeBid(bid)))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    return throwError(error);
  }

}
