import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Attribute, Auction, Bid, LFO, LFOData, NFT, NFTMetadata } from '../features/nfts/nft.interface';
import { ethers } from 'ethers';

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
  const baseArweaveURL = 'https://arweave.net/';
  const imageHash = baseArweaveURL + res['image'].substring(5);
  const animationURL = baseArweaveURL + res['animation_url'].substring(5);

  return {
    id: +nftId,
    name: res['name'],
    description: res['description'],
    imageHash: imageHash,
    animationURL: animationURL,
    attributes: attributes
  }
};

export const normalizeLFOData = (nftId: string, res: any): LFOData => {
  const baseArweaveURL = 'https://arweave.net/';
  const lfos: LFO[] = res['lfos'].map(
    (lfo: { [x: string]: any }) => (
      {
        payee: lfo['payee'],
        paidDate: lfo['paidDate'],
        amountPaid: lfo['amountPaid'],
        imageHash: baseArweaveURL + lfo['receiptImage'].substring(5),
      }
    )
  );

  return {
    id: +nftId,
    lfos: lfos
  }
};


export const normalizeNFT = (nft: any): NFT => {
  // trim the leading five characters of nft.metadataURI
  const metadataHash = nft.metadataURI.substring(5);

  let lfoDataHash = '';
  if (nft.data !== '0x00000000') {
    lfoDataHash = ethers.utils.toUtf8String(ethers.utils.arrayify(nft.data)).substring(5);
  }

  return {
    id: +nft.id,
    lfoDataHash: lfoDataHash,
    name: '',
    description: '',
    imageHash: '',
    animationURL: '',
    owner: nft.owner.id,
    metadataHash: metadataHash,
    isFrozen: nft.isFrozen,
    lfos: []
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

auctionsByNFTGql = (nftId: string) => `
{
  auctions (where: {nft: "${nftId}"}) {
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

bidsByNFTGql = (nftId: string) => `
{
  bids(where: {nft: "${nftId}"}) {
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

  getNFT(nftId: string): Observable<NFT> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftGql(nftId)})
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.nft),
      map(nft => normalizeNFT(nft))
    );
  }

  getNFTMetadata(nftId: string, metadataHash: string): Observable<NFTMetadata> {
    return this.http.get(`https://arweave.net/${metadataHash}`)
    .pipe(
      map(res => normalizeNFTMetadata(nftId, res)),
    );
  }

  getLFOData(nftId: string, lfoDataHash: string): Observable<LFOData> {
    if (!lfoDataHash) return of({id: +nftId, lfos: []});
    return this.http.get(`https://arweave.net/${lfoDataHash}`)
    .pipe(
      map(res => normalizeLFOData(nftId, res)),
    );
  }

  getNFTs(): Observable<NFT[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.nftsGql })
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.nfts),
      map(nfts => nfts.map((nft: any) => normalizeNFT(nft))),
    );
  }

  getAuctions(): Observable<Auction[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.auctionsGql })
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.auctions),
      map(auctions => auctions.map((auction: any) => normalizeAuction(auction))),
    );
  }

  getAuctionsByNFT(nftId: string): Observable<Auction[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.auctionsByNFTGql(nftId) })
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.auctions),
      map(auctions => auctions.map((auction: any) => normalizeAuction(auction))),
    );
  }

  getBids(): Observable<Bid[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.bidsGql })
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.bids),
      map(bids => bids.map((bid: any) => normalizeBid(bid)))
    );
  }

  getBidsByNFT(nftId: string): Observable<Bid[]> {
    return this.http.post<NFTResponse>(this.graphURL, { query: this.bidsByNFTGql(nftId) })
    .pipe(
      tap((res: any) => {
        if (res.errors) throw new Error(res.errors[0].message);
      }),
      map(res => res.data.bids),
      map(bids => bids.map((bid: any) => normalizeBid(bid)))
    );
  }

}
