import { task, types } from 'hardhat/config';
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import { Restore, Justice } from '../../typechain';
import { TASK_SET_JUSTICE } from '../task-names';
// hh set-justice --network localhost|rinkeby|mainnet
task(TASK_SET_JUSTICE, 'Sets the Justice contract')
  .setAction(async ({ }, hre) => {

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

    const setJusticeTx: ContractTransaction = await restoreContract.connect(deployer)
      .setJustice(justiceContract.address);

    const setJusticeReceipt: ContractReceipt = await setJusticeTx.wait();
    console.log('justice set:', setJusticeReceipt);

    process.exit(0)
  });