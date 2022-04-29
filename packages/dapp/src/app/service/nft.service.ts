import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Attribute, Auction, Bid, NFT, NFTMetadata } from '../features/nfts/nft.interface';
import { parseBytes32String } from 'ethers/lib/utils';

export interface NFTResponse {
	nfts: NFT[];
  auctions: Auction[];
}

export const normalizeNFTMetadata = (nftId: string, res: any): NFTMetadata => {
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
    id: +nftId,
    name: res['name'],
    description: res['description'],
    imageHash: imageHash,
    animationURL: animationURL,
    attributes: attributes
  }
};

export const normalizeNFT = (nft: any): NFT => {
  // trim the leading five characters of nft.metadataURI
  const metadataHash = nft.metadataURI.substring(5);

  const dataString = parseBytes32String(nft.data);

  return {
    id: +nft.id,
    data: dataString,
    name: '',
    description: '',
    imageHash: '',
    animationURL: '',
    owner: nft.owner.id,
    metadataHash: metadataHash,
    isFrozen: nft.isFrozen
  }
};

export const normalizeAuction = (auction: any): Auction => {
  const winnerId = auction.winner ? auction.winner.id : '';
  const bidderId = auction.bidder ? auction.bidder.id : '';
  const creatorId = auction.creator ? auction.creator.id : '';

  return {
    id: +auction.id,
    nftId: +auction.nft.id,
    winnerId: winnerId,
    bidderId: bidderId,
    creatorId: creatorId,
    amount: auction.amount,
    startTime: auction.startTime,
    endTime: auction.endTime,
    settled: auction.settled
  }
};

export const normalizeBid = (bid: any): Bid => (
  {
    id: +bid.id,
    auctionId: +bid.auction.id,
    nftId: +bid.nft.id,
    bidder: bid.bidder.id,
    amount: bid.amount,
    blockTimestamp: bid.blockTimestamp,
    blockNumber: bid.blockNumber,
    txIndex: bid.txIndex
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
    auction {
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

  getNFTMetadata(nftId: string, metadataHash: string): Observable<NFTMetadata> {
    return this.http.get(`https://arweave.net/${metadataHash}.json`)
    .pipe(
      map(res => normalizeNFTMetadata(nftId, res)),
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
