import { Injectable } from '@angular/core';
import Web3Modal from 'web3modal';
import { from, Observable, Subject } from 'rxjs';
import { filter, take} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAccountAddress } from './../features/wallet/reducers/index';
import { logoutUser, setNetworkName, setAccountAddress, loadContractAllowance, loadUserBalance } from './../features/wallet/wallet.actions';

import networkMapping from './../../deployments.json';
import { BigNumber, ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallet: any;
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.providers.JsonRpcSigner;
  private web3Modal: Web3Modal;

  private justiceContract: ethers.Contract;
  private restoreContract: ethers.Contract;

  private accountStatusSource = new Subject<any>();
  accountStatus$ = this.accountStatusSource.asObservable();

  logoutEvent$ = new Subject<void>();

  constructor(private store: Store) {
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
  }

  async processProvider(): Promise<void> {
    try {
      this.wallet = await this.web3Modal.connect();
      this.provider = new ethers.providers.Web3Provider(this.wallet);

      this.initializeSignerAndContract();

      // this.setupListeners();
    }
    catch (e) {
      console.log(e);
    }
  }

  // TODO: Subscribe to accounts change
  // private setupListeners(): void {

  private async initializeSignerAndContract(): Promise<void> {
   const signerUnkChain = this.provider.getSigner();
    if (signerUnkChain) {
      const chainId: number = await signerUnkChain.getChainId();
      const chainIdStr: string = chainId.toString();
      const networkName: string = await this.provider.getNetwork().then(network => network.name);

      const networkMappingForChain =
      networkMapping[chainIdStr as keyof typeof networkMapping];

      // only update network name or address if the Justice contract has been deployed
      if (networkMappingForChain !== undefined) {
        this.store.dispatch(setNetworkName({ networkName }));

        const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];
        this.justiceContract = new ethers.Contract(justiceMapping.address, justiceMapping.abi, this.provider);
        console.log(`Justice Contract Address ${this.justiceContract.address}`);

        const restoreMapping = networkMappingForChain[0]['contracts']['Restore'];
        this.restoreContract = new ethers.Contract(restoreMapping.address, restoreMapping.abi, this.provider);
        console.log(`Restore Contract Address ${this.restoreContract.address}`);

        this.signer = signerUnkChain;
        this.provider.listAccounts().then(res => {
          const address = res[0];
          this.store.dispatch(setAccountAddress({ accountAddress: address }));
          this.store.dispatch(loadContractAllowance({ accountAddress: address, contractAddress: this.justiceContract.address }));
          this.store.dispatch(loadUserBalance({ accountAddress: address }));
        })

      } else {
        throw new Error('No contract found for this chain, please switch to Rinkeby or Mainnet');
      }
    }
  }

  public getBalanceOf(accountAddress: string): Observable<BigNumber> {
    return from(this.restoreContract.balanceOf(accountAddress)) as Observable<BigNumber>;
  }

  public getJusticeContract(): any {
    return this.justiceContract;
  }

  public clearProvider() {
    this.web3Modal.clearCachedProvider();
  }

}
