import { task, types } from 'hardhat/config';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { Restore } from '../../typechain';
import { TASK_TRANSFERBUYER } from '../task-names';
// hh transferbuyer --network localhost|rinkeby|mainnet --token-id 0 --lfo-uri "ar://vMMzKyvqhN9khzLWZX1A0yEpMpy3qKPtOMgnIH-_1mQ"
task(TASK_TRANSFERBUYER, 'Transfers the token to the buyer')
  .addParam('tokenId', 'tokenId', null, types.int)
  .addParam('lfoURI', 'lfoURI', null, types.string)
  .setAction(async ({ tokenId, lfoURI }, hre) => {

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const restoreDeployment = await deployments.get('Restore');
    console.log(`restore contract address: ${restoreDeployment.address}`);

    const restoreContract: Restore = new ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;

    const data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(lfoURI));
  
    const transferToBuyerTx: ContractTransaction = await
      restoreContract.connect(deployer).transferToBuyer(tokenId, data);

    // wait for the transaction to be mined
    const transferToBuyerReceipt: ContractReceipt = await transferToBuyerTx.wait();

    process.exit(0)
  });