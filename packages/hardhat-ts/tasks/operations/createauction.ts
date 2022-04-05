import { task, types } from 'hardhat/config';
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import { Justice } from '../../typechain';
import { TASK_CREATEAUCTION } from '../task-names';
// hh createauction --network localhost|rinkeby|mainnet --token-id 0 --creator-addr 0x911753aB62fFd27B78C6db07685DBf0089634eb4 --split 70,20,10
task(TASK_CREATEAUCTION, 'Creates an auction from a token')
  .addParam('tokenId', 'tokenId', null, types.int)
  .addParam('creatorAddr', 'The artist address if available or pr1son art payment address', null, types.string)
  .addParam('split', 'Array of percentages to split the income', '70,20,10', types.string)
  .setAction(async ({ tokenId, creatorAddr, split }, hre) => {

    if (!creatorAddr) {
      console.log('Creator Address is required');
      process.exit(0)
    }
    console.log('creatorAddr:', creatorAddr)

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await hre.ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const justiceDeployment = await deployments.get('Justice');
    console.log(`justice contract address: ${justiceDeployment.address}`);

    const justiceContract: Justice = new hre.ethers.Contract(justiceDeployment.address, justiceDeployment.abi, deployer) as Justice;

    console.log('creating auction for tokenId:', tokenId);
    const splitArray = split.split(',').map((string: any) => BigNumber.from(string));
    console.log('with splits:', splitArray);

    const createAuctionTx: ContractTransaction = await justiceContract.connect(deployer).createAuction(creatorAddr, tokenId, splitArray);
    const createAuctionReceipt: ContractReceipt = await createAuctionTx.wait();
    console.log('auction created:', createAuctionReceipt);
    
    process.exit(0)
  });