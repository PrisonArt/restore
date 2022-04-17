import { Injectable } from '@angular/core';
import Web3Modal from 'web3modal';
import { Subject } from 'rxjs';
import { filter, take} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { getAccountAddress } from './../features/wallet/reducers/index';
import { /* logoutUser */ setAccountAddress, loadContractAllowance, loadUserBalance } from './../features/wallet/wallet.actions';

import networkMapping from './../../deployments.json';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallet: any;
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.providers.JsonRpcSigner;
  private web3Modal: Web3Modal;

  private justiceContract: any;

  private accountStatusSource = new Subject<any>();
  accountStatus$ = this.accountStatusSource.asObservable();

  logoutEvent$ = new Subject<void>();

  constructor(private store: Store) {
    this.setupWeb3Modal();

    this.store.select(getAccountAddress)
      .pipe(
        take(1),
        filter(address => !!address)
      )
      .subscribe(_ => {
        this.connectWallet();
      });
  }

  private setupWeb3Modal(): void {
    const providerOptions = {};

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
    });
  }

  async connectWallet(): Promise<void> {
    await this.processProvider();
    this.initializeContracts();
  }

  async processProvider(): Promise<void> {
    try {
      this.wallet = await this.web3Modal.connect();
      this.provider = new ethers.providers.Web3Provider(this.wallet);
      this.signer = this.provider.getSigner();

      this.initializeContracts();

      if (this.signer) {
        this.store.dispatch(setAccountAddress({ accountAddress: this.signer._address }));
        this.store.dispatch(loadContractAllowance({ accountAddress: this.signer._address, contractAddress: this.getJusticeContract().address }));
        this.store.dispatch(loadUserBalance({ accountAddress: this.signer._address }));
        // this.setupListeners();
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  // TODO: Subscribe to accounts change
  // private setupListeners(): void {


  private async initializeContracts(): Promise<void> {
    const chainId: number = await this.signer.getChainId();
    const chainIdStr: string = chainId.toString();
    console.log(`Connected on chain ${chainId}`);

    const networkMappingForChain =
    networkMapping[chainIdStr as keyof typeof networkMapping];

    if (networkMappingForChain !== undefined) {
      const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];

      this.justiceContract = new ethers.Contract(justiceMapping.address, justiceMapping.abi);
      console.log(this.justiceContract.address);
    }
  }

  public getJusticeContract(): any {
    return this.justiceContract;
  }

  public clearProvider() {
    this.web3Modal.clearCachedProvider();
  }

}
