import { task, types } from 'hardhat/config';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { Restore } from '../../typechain';
import { TASK_MINT } from '../task-names';
// hh mint --network localhost|rinkeby|mainnet --metadata-uri ar://37BNWQaxMNKcAAXtZd4XTzSDiDzGOugqyp_arVmgXP4
task(TASK_MINT, 'Mints a token with token metadata uri')
  .addParam('metadataUri', 'The token URI', null, types.string)
  .setAction(async ({ metadataUri }, hre) => {

    if (!metadataUri.startsWith('ar://')) {
      console.log('token-id must begin with ar://');
      process.exit(0)
    }
    console.log('mintTokenURI:', metadataUri)

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const restoreDeployment = await deployments.get('Restore');
    console.log(`restore contract address: ${restoreDeployment.address}`);

    const restoreContract: Restore = new ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;

    const mintTx: ContractTransaction = await restoreContract.connect(deployer)
      .mintForAuction(deployer.address, metadataUri, { gasLimit: 300000 });

    const mintReceipt: ContractReceipt = await mintTx.wait();
    console.log('minted:', mintReceipt);

    let tokenId = 0;
    if (mintReceipt.events) {
      mintReceipt.events.forEach(event => {
        if (event.event === 'ReadyForAuction') {
          if (event.args && event.args.tokenId) {
            console.log('ReadyForAuction:', event.args.tokenId);
            tokenId = event.args.tokenId;
          }
        }
      });
    }

    process.exit(0)
  });