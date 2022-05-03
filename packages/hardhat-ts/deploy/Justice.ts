import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { Restore } from '../typechain';


const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy, get } = deployments;

  let payment = '';
  let fund = '';
  const namedAccounts = await getNamedAccounts();
  
  const [ deployer ] = await ethers.getSigners();

  if (hre.network.name === 'hardhat') {
    payment = namedAccounts.payment;
    fund = namedAccounts.fund;
  } else if (hre.network.name === 'rinkeby') {
    payment = process.env['RINKEBY_PAYMENT_ADDRESS'] || '';
    fund = process.env['RINKEBY_FUND_ADDRESS'] || '';
  } else if (hre.network.name === 'mainnet') {
    payment = process.env['MAINNET_PAYMENT_ADDRESS'] || '';
    fund = process.env['MAINNET_FUND_ADDRESS'] || '';
  }

  console.log('network:', hre.network.name);
  console.log('deployer address:', deployer);
  console.log('payment address:', payment);
  console.log('fund address:', fund);

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = '100000000000000000';
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  const restoreDeployment = await get('Restore');
  const wethDeployment = await get('WETH');
  
  const deployResult = await deploy('Justice', {
    from: deployer.address,
    // gas: 4000000,
    args: [
      restoreDeployment.address,
      wethDeployment.address,
      payment,
      fund,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION],
  });

  // get address from the deployed justice contract
  const justiceAddress = deployResult.address;
  console.log('justice contract address:', justiceAddress);

  // get contract instance from the deployed restore contract
  console.log(`restore contract address: ${restoreDeployment.address}`);
  const restoreContract: Restore = new hre.ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;
  
  // set the justice contract address in the restore contract
  const setJusticeTx: ContractTransaction = await restoreContract.connect(deployer)
    .setJustice(justiceAddress);

  const setJusticeReceipt: ContractReceipt = await setJusticeTx.wait();

  if (setJusticeReceipt.status === 1) {
    console.log('justice set successfully');
  } else {
    console.log('justice set failed with status:', setJusticeReceipt.status);
  }
};
export default func;
func.runAtTheEnd = true;