import { task } from 'hardhat/config';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { Justice } from '../../typechain';
import { TASK_SETTLE } from '../task-names';
// hh settle --network localhost|rinkeby|mainnet
task(TASK_SETTLE, 'Settles the Auction, and if not sold, returns token to PrisonArt')
  .setAction(async ({ }, hre) => {

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const justiceDeployment = await deployments.get('Justice');
    console.log(`justice contract address: ${justiceDeployment.address}`);

    const justiceContract: Justice = new ethers.Contract(justiceDeployment.address, justiceDeployment.abi, deployer) as Justice;

    const settleTx: ContractTransaction = await justiceContract.connect(deployer)
      .settleAuction();

    // wait for the transaction to be mined
    const settleReceipt: ContractReceipt = await settleTx.wait();

    process.exit(0)
  });