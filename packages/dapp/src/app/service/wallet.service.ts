import { Injectable } from '@angular/core';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { from, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { setAccountAddress, setMinBidIncrementPercentage, setNetworkName, setReservePrice, loadContractAllowance, loadUserBalance } from './../features/wallet/wallet.actions';

import { environment as env } from '../../environments/environment';
import networkMapping from './../../deployments.json';
import { BigNumber, providers, ethers, ContractTransaction } from 'ethers';
import { NotificationService } from 'app/core/notifications/notification.service';
import { auctionsLoadByNFT, auctionsLoadByNFTBidValue, bidsLoadByNFT, bidsLoadByNFTBidValue, nftLoad } from 'app/features/nfts/nft.actions';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallet: any;
  private wsProvider: providers.JsonRpcProvider;
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
      this.wsProvider = this.getWsRpcProvider(this.wsRpcUri);

      const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];
      this.wsJusticeContract = new ethers.Contract(justiceMapping.address, justiceMapping.abi, this.wsProvider);
      console.log(`Justice Contract Address ${this.wsJusticeContract.address}`);
      this.getReservePrice().then(reservePrice => this.store.dispatch(setReservePrice({ reservePrice })))
      this.getMinBidIncrementPercentage().then(minBidIncrementPercentage => this.store.dispatch(setMinBidIncrementPercentage({ minBidIncrementPercentage })))

      const restoreMapping = networkMappingForChain[0]['contracts']['Restore'];
      this.wsRestoreContract = new ethers.Contract(restoreMapping.address, restoreMapping.abi, this.wsProvider);
      console.log(`Restore Contract Address ${this.wsRestoreContract.address}`);

      this.wsJusticeContract.on('AuctionCreated', (tokenId) => {
        console.log('Auction created received: ', tokenId); // uint256
        // wait for five seconds before loading the auction
        setTimeout(() => {
          this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
          this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
        }, 5000);
      });
      this.wsJusticeContract.on('AuctionBid', (tokenId, sender, value: any, extended) => {
        console.log('Auction bid received: ', tokenId, ' Value: ', value._hex, ' Extended: ', extended); // uint256
        this.store.dispatch(auctionsLoadByNFTBidValue({ nftId: tokenId, value: BigNumber.from(value).toString() }));
        this.store.dispatch(bidsLoadByNFTBidValue({ nftId: tokenId, value: BigNumber.from(value).toString() }));
      });
      this.wsJusticeContract.on('AuctionExtended', (tokenId) => {
        console.log('Auction extended: ', tokenId); // uint256
        this.notificationService.info('Auction extended');
      });
      this.wsJusticeContract.on('AuctionSettled', (tokenId) => {
        console.log('Auction settled: ', tokenId); // uint256
        // wait for five seconds before loading the nft
        setTimeout(() => {
          this.store.dispatch(nftLoad({ nftId: tokenId }));
          this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
          this.store.dispatch(bidsLoadByNFT({ nftId: tokenId }));
        }, 5000);
      });
      this.wsRestoreContract.on('ReadyForAuction', (to, tokenId) => {
        console.log('ReadyForAuction: ', tokenId); // uint256
        // wait for five seconds before loading the nft
        setTimeout(() => {
          this.store.dispatch(nftLoad({ nftId: tokenId }));
        }, 5000);
      });
      this.wsRestoreContract.on('ArtFrozen', (buyer, tokenId) => {
        console.log('ArtFrozen: ', tokenId); // uint256
        // wait for five seconds before loading the nft
        setTimeout(() => {
          this.store.dispatch(nftLoad({ nftId: tokenId }));
        }, 5000);
      });
      this.wsRestoreContract.on('ArtTransferred', (buyer, tokenId) => {
        console.log('ArtTransferred: ', tokenId); // uint256
        // wait for five seconds before loading the nft
        setTimeout(() => {
          this.store.dispatch(nftLoad({ nftId: tokenId }));
          this.store.dispatch(auctionsLoadByNFT({ nftId: tokenId }));
        }, 5000);
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
    let gasLimit: BigNumber | void = BigNumber.from(0);

    if (value !== 0) {
      gasLimit = await justiceContractWithSigner.estimateGas.createBid(nftId, {
        value: ethers.utils.parseEther(value.toString()),
      }).catch(
        (error: any) => {
          this.notificationService.error('Error while estimating gas on bid: ' + this.getVMExceptionMessage(error));
        }
      );

      if (gasLimit !== undefined) {
        justiceContractWithSigner.createBid(nftId, {
            value: ethers.utils.parseEther(value.toString()),
            gasLimit: gasLimit.add(10_000), // A 10,000 gas pad is used to avoid 'Out of gas' errors
          }).then(
          (responseBid: ContractTransaction) => {
            console.log('Bid currently mining.', responseBid);
            responseBid.wait().then(() => {
              this.notificationService.success('Successful Bid');
              console.log('Successful Bid');
            }).catch(
              (error: any) => {
                this.notificationService.error('Bid Failed');
                console.log('Bid Failed:', error);
              }
            );
          }
        ).catch(
          (error: any) => {
            this.notificationService.error('Error while placing bid: ' + this.getEthJSErrorMessage(error));
          }
        );
      }
    }
  }

  public clearProvider() {
    this.web3Modal.clearCachedProvider();
  }

  getENS(address: string): Observable<string> {
    if (!this.wsProvider) {
      return of(address);
    }
    try {
      return from(this.wsProvider.lookupAddress(address)) as Observable<string>;
    } catch (e) {
      console.log('getENS error:', e);
      return of(address);
    }
  }

  private getEthJSErrorMessage(error: any): string {
    if (error.hasOwnProperty('message')) {
      const prefixStr = '[ethjs-query] while formatting outputs from RPC \'';
      if (error.message.startsWith(prefixStr)) {
        const errAsString = error.message.substring(prefixStr.length, error.message.length - 1);
        const obj = JSON.parse(errAsString);
        if (obj.value.hasOwnProperty('data')) {
          return this.parseVMReason(obj.value.data.message);
        } else {
          return obj.value.message;
        }
      } else {
        return this.parseVMReason(error.message);
      }
    } else {
      return '';
    }
  }

  private getVMExceptionMessage(error: any): string {
    if (error.hasOwnProperty('data') && error.data.hasOwnProperty('message')) {
      return this.parseVMReason(error.data.message);
    } else {
      return '';
    }
  }

  private parseVMReason(message: string): string {
    const prefixStr = 'Error: VM Exception while processing transaction: reverted with reason string \'';
    if (message.startsWith(prefixStr)) {
      const reasonStr = message.substring(prefixStr.length, message.length - 1);
      return reasonStr;
    } else {
      return message;
    }
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
