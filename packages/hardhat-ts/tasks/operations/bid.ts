import { task, types } from 'hardhat/config';
import { ContractTransaction } from 'ethers';
import { Justice } from '../../typechain';
import { TASK_BID } from '../task-names';
// hh bid --network localhost|rinkeby|mainnet --token-id 0 --amount 1000
task(TASK_BID, 'Mints a token with token metadata uri, then creates an auction with the token')
  .addParam('tokenId', 'tokenId', null, types.int)
  .addParam('amount', 'bid amount', null, types.int)
  .setAction(async ({ tokenId, amount }, hre) => {

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const justiceDeployment = await deployments.get('Justice');
    console.log(`justice contract address: ${justiceDeployment.address}`);

    const justiceContract: Justice = new ethers.Contract(justiceDeployment.address, justiceDeployment.abi, deployer) as Justice;

    const createBidTx: ContractTransaction = await justiceContract.connect(deployer)
      .createBid(tokenId, {
        value: amount
      });

    process.exit(0)
  });