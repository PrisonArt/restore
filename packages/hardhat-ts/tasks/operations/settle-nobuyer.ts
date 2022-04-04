import { task, types } from 'hardhat/config';
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import { Restore, Justice } from '../../typechain';
import { TASK_SETTLE_NOBUYER } from '../task-names';
// hh settle-nobuyer --network localhost|rinkeby|mainnet --token-id 0
task(TASK_SETTLE_NOBUYER, 'Settles an Auction with no buyer')
  .addParam('tokenId', 'tokenId', null, types.int)
  .setAction(async ({ tokenId, amount }, hre) => {

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await hre.ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const restoreDeployment = await deployments.get('Restore');
    console.log(`restore contract address: ${restoreDeployment.address}`);

    const justiceDeployment = await deployments.get('Justice');
    console.log(`justice contract address: ${justiceDeployment.address}`);

    const restoreContract: Restore = new hre.ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;
    const justiceContract: Justice = new hre.ethers.Contract(justiceDeployment.address, justiceDeployment.abi, deployer) as Justice;

    const createBidTx: ContractTransaction = await justiceContract.connect(deployer)
      .settleAuction();

    // wait for the transaction to be mined
    const createBidReceipt: ContractReceipt = await createBidTx.wait();

    process.exit(0)
  });