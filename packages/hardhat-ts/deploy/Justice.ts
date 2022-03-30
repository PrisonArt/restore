import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;

  let deployer = '';
  let payment = '';
  let fund = '';

  const namedAccounts = await getNamedAccounts();
  deployer = namedAccounts.deployer;

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
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  const restore = await get('Restore');
  const weth = await get('WETH');
  
  await deploy("Justice", {
    from: deployer,
    // gas: 4000000,
    args: [
      restore.address,
      weth.address,
      payment,
      fund,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION],
  });

  console.log("deployed Justice");
};
export default func;
func.runAtTheEnd = true;