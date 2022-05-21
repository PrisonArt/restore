import { task, types } from 'hardhat/config';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { Restore } from '../../typechain';
import { TASK_SETROYALTIES } from '../task-names';
// hh setroyalties --network localhost|rinkeby|mainnet --royalty-amount 10
task(TASK_SETROYALTIES, 'Sets contract-wide royalties for all Restore NFTs')
  .addParam('royaltyAmount', 'The percentage royalty to be charged on all secondary sales', null, types.int)
  .setAction(async ({ royaltyAmount }, hre) => {

    const { deployments, ethers } = hre;

    const royalty = ethers.BigNumber.from(royaltyAmount)
    console.log('royaltyAmount:', royalty)

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const restoreDeployment = await deployments.get('Restore');
    console.log(`restore contract address: ${restoreDeployment.address}`);

    const restoreContract: Restore = new ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;

    const royaltyTx: ContractTransaction = await restoreContract.connect(deployer)
      .setRoyalties(deployer.address, royalty, { gasLimit: 300000 });

    const royaltyReceipt: ContractReceipt = await royaltyTx.wait();
    console.log('royalties set:', royaltyReceipt);

    process.exit(0)
  });