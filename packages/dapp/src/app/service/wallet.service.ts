import { Injectable } from '@angular/core';
import Web3Modal from 'web3modal';
import { from, Observable, Subject } from 'rxjs';
import { filter, take} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAccountAddress } from './../features/wallet/reducers/index';
import { logoutUser, setAccountAddress, setMinBidIncrementPercentage, setNetworkName, setReservePrice, loadContractAllowance, loadUserBalance } from './../features/wallet/wallet.actions';

import networkMapping from './../../deployments.json';
import { BigNumber, ethers } from 'ethers';
import { NotificationService } from 'app/core/notifications/notification.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallet: any;
  private provider: ethers.providers.Web3Provider;
  private web3Modal: Web3Modal;

  private justiceContract: ethers.Contract;
  private restoreContract: ethers.Contract;

  constructor(private store: Store,
    private notificationService: NotificationService) {
    this.setupWeb3Modal();

    this.store.select(selectAccountAddress)
      .pipe(
        take(1),
        filter(address => !!address)
      )
      .subscribe(_ => {
        this.connectWallet();
      });
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
    return from(this.restoreContract.balanceOf(accountAddress)) as Observable<BigNumber>;
  }

  async bid(nftId: number, value: number) {
    const signer_ = this.provider.getSigner();
    const justiceContractWithSigner = this.justiceContract.connect(signer_);
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

  public getJusticeContract(): any {
    return this.justiceContract;
  }

  public clearProvider() {
    this.web3Modal.clearCachedProvider();
  }

  private setupWeb3Modal(): void {
    const providerOptions = {};

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

    const [chainIdStr, networkName] =await this.provider.getNetwork().then(network =>
      [network.chainId.toString(), network.name] as const
    );

    const networkMappingForChain =
    networkMapping[chainIdStr as keyof typeof networkMapping];

    // only update network name or address if the Justice contract has been deployed
    if (networkMappingForChain !== undefined) {
      this.store.dispatch(setNetworkName({ networkName }));

      const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];
      this.justiceContract = new ethers.Contract(justiceMapping.address, justiceMapping.abi, this.provider);
      console.log(`Justice Contract Address ${this.justiceContract.address}`);
      this.store.dispatch(setReservePrice({ reservePrice: await this.getReservePrice() }));
      this.store.dispatch(setMinBidIncrementPercentage({ minBidIncrementPercentage: await this.getMinBidIncrementPercentage() }));

      const restoreMapping = networkMappingForChain[0]['contracts']['Restore'];
      this.restoreContract = new ethers.Contract(restoreMapping.address, restoreMapping.abi, this.provider);
      console.log(`Restore Contract Address ${this.restoreContract.address}`);
    } else {
      throw new Error('No contract found for this chain, please switch to Rinkeby or Mainnet');
    }
  }

  private async updateAccount() {
    console.log('Update account');
    this.provider.listAccounts().then(res => {
      const address = res[0];
      this.store.dispatch(setAccountAddress({ accountAddress: address }));
      this.store.dispatch(loadContractAllowance({ accountAddress: address, contractAddress: this.justiceContract.address }));
      this.store.dispatch(loadUserBalance({ accountAddress: address }));
    });
  }

  private async getMinBidIncrementPercentage(): Promise<number> {
    const minBidIncrementPercentage = await this.justiceContract.minBidIncrementPercentage();
    return BigNumber.from(minBidIncrementPercentage).toNumber();
  }

  private async getReservePrice(): Promise<number> {
    const reservePrice = await this.justiceContract.reservePrice();
    return BigNumber.from(reservePrice).toNumber();
  }
}
