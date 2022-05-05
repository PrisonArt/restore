import { Injectable } from '@angular/core';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { from, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { setAccountAddress, setMinBidIncrementPercentage, setNetworkName, setReservePrice, loadContractAllowance, loadUserBalance } from './../features/wallet/wallet.actions';

import { environment as env } from '../../environments/environment';
import networkMapping from './../../deployments.json';
import { BigNumber, providers, ethers } from 'ethers';
import { NotificationService } from 'app/core/notifications/notification.service';
import { auctionsLoadByNFT, bidsLoadByNFT, nftLoad } from 'app/features/nfts/nft.actions';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallet: any;
  private provider: ethers.providers.Web3Provider;
  private web3Modal: Web3Modal;

  private wsJusticeContract: ethers.Contract;
  private wsRestoreContract: ethers.Contract;

  private wsRpcUri: string;
  private chainId: string;
  private network: string;
  private infuraProjectId: string;

  constructor(private store: Store,
    private notificationService: NotificationService) {
    this.wsRpcUri = env.wsRpcUri;
    this.chainId = env.chainId;
    this.network = env.network;
    this.infuraProjectId = env.infuraProjectId;

    this.setupWeb3Modal();

    const networkMappingForChain =
    networkMapping[this.chainId as keyof typeof networkMapping];
    if (networkMappingForChain !== undefined) {
      const wsProvider = this.getWsRpcProvider(this.wsRpcUri);

      const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];
      this.wsJusticeContract = new ethers.Contract(justiceMapping.address, justiceMapping.abi, wsProvider);
      console.log(`Justice Contract Address ${this.wsJusticeContract.address}`);
      this.getReservePrice().then(reservePrice => this.store.dispatch(setReservePrice({ reservePrice })))
      this.getMinBidIncrementPercentage().then(minBidIncrementPercentage => this.store.dispatch(setMinBidIncrementPercentage({ minBidIncrementPercentage })))

      const restoreMapping = networkMappingForChain[0]['contracts']['Restore'];
      this.wsRestoreContract = new ethers.Contract(restoreMapping.address, restoreMapping.abi, wsProvider);
      console.log(`Restore Contract Address ${this.wsRestoreContract.address}`);

      this.wsJusticeContract.on('AuctionCreated', (tokenId) => {
        console.log('Auction created received: ', tokenId); // unit256
        this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
        this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
      });
      this.wsJusticeContract.on('AuctionBid', (tokenId, sender, value, extended) => {
        console.log('Auction bid received: ', tokenId, ' Extended: ', extended); // unit256

        if (extended) this.notificationService.info('Auction extended');
        this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
        this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
      });
      this.wsJusticeContract.on('AuctionExtended', (tokenId) => {
        console.log('Auction extended: ', tokenId); // unit256
        this.notificationService.info('Auction extended');
        this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
        this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
      });
      this.wsJusticeContract.on('AuctionSettled', (tokenId) => {
        console.log('Auction settled: ', tokenId); // unit256
        this.store.dispatch(nftLoad({ nftId: tokenId }));
        this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
        this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
      });
      this.wsRestoreContract.on('ReadyForAuction', (to, tokenId) => {
        console.log('ReadyForAuction: ', tokenId); // unit256
        this.store.dispatch(nftLoad({ nftId: tokenId }));
      });
      this.wsRestoreContract.on('ArtFrozen', (buyer, tokenId) => {
        console.log('ArtFrozen: ', tokenId); // unit256
        this.store.dispatch(nftLoad({ nftId: tokenId }));
      });
      this.wsRestoreContract.on('ArtTransferred', (buyer, tokenId) => {
        console.log('ArtTransferred: ', tokenId); // unit256
        this.store.dispatch(nftLoad({ nftId: tokenId }));
        this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
      });
    }
  }

  public async connectWallet() {
    try {
      this.wallet = await this.web3Modal.connect();
      this.provider = new ethers.providers.Web3Provider(this.wallet, 'any');

      await this.updateChain();
      await this.updateAccount();

      this.setupListeners();
    }
    catch (e) {
      console.log(e);
    }
  }

  public getBalanceOf(accountAddress: string): Observable<BigNumber> {
    return from(this.wsRestoreContract.balanceOf(accountAddress)) as Observable<BigNumber>;
  }

  async bid(nftId: number, value: number) {
    const signer_ = this.provider.getSigner();
    const justiceContractWithSigner = this.wsJusticeContract.connect(signer_);
    if (value !== 0) {
      justiceContractWithSigner.createBid(nftId, { value: ethers.utils.parseEther(value.toString()) }).then(
        (responseBid: any) => {
          this.notificationService.success('Bid placed.');
          console.log('Bid placed succesfully.', responseBid);
        }
      ).catch(
        (error: any) => {
          const prefixReasonStr = 'Error: VM Exception while processing transaction: reverted with reason string \'';

          if (error.data.message.startsWith(prefixReasonStr)) {
            const reasonStr = error.data.message.substring(prefixReasonStr.length, error.data.message.length - 1);
            this.notificationService.error(`Error while placing bid: ${reasonStr}`);
          } else {
            this.notificationService.error(`Error while placing bid: ${error.data.message}`);
          }
          console.log('Error while placing bid: ', error.data.message);
        }
      );
    }
  }

  public clearProvider() {
    this.web3Modal.clearCachedProvider();
  }

  private setupWeb3Modal(): void {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: this.infuraProjectId,
        },
      },
    };

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
    });
  }

  private setupListeners() {
    console.log('Setting up listeners');
    this.wallet.on('accountsChanged', async (accounts: string[]) => {
      console.log('Accounts changed');
      await this.updateAccount();
    });
    this.wallet.on('chainChanged', async (chainId: number) => {
      console.log('Chain changed');
      await this.updateChain();
    });
  }

  private async updateChain() {
    console.log('Update Chain');

    // get the network the wallet is currently connected to
    const [connectedNetworkName] =await this.provider.getNetwork().then(network =>
      [network.name] as const
    );
    this.store.dispatch(setNetworkName({ networkName: connectedNetworkName }));

    // only update network name or address if the Justice contract has been deployed
    if (connectedNetworkName !== this.network) {
      this.notificationService.error('Please connect your wallet to the correct network: ' + this.network);
    }
  }

  private getWsRpcProvider(urlString: string) {
    const url = new URL(urlString);
    switch (url.protocol) {
      case 'http:':
      case 'https:':
        return new providers.JsonRpcProvider(url.href);
      case 'wss:':
        return new providers.WebSocketProvider(url.href);
      default:
        throw new Error(`Network URL not valid: '${url.href}'`);
    }
  }

  private async updateAccount() {
    console.log('Update account');
    this.provider.listAccounts().then(res => {
      const address = res[0];
      this.store.dispatch(setAccountAddress({ accountAddress: address }));
      this.store.dispatch(loadContractAllowance({ accountAddress: address, contractAddress: this.wsJusticeContract.address }));
      this.store.dispatch(loadUserBalance({ accountAddress: address }));
    });
  }

  private async getMinBidIncrementPercentage(): Promise<number> {
    const minBidIncrementPercentage = await this.wsJusticeContract.minBidIncrementPercentage();
    return BigNumber.from(minBidIncrementPercentage).toNumber();
  }

  private async getReservePrice(): Promise<string> {
    const reservePrice = await this.wsJusticeContract.reservePrice();
    return BigNumber.from(reservePrice).toString();
  }
}
