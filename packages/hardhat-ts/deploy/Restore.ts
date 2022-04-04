import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const PROXY_REGISTRATION_ADDRESS = '0xf57b2c51ded3a29e6891aba85459d600256cf317';

  // the following will only deploy 'GenericMetaTxProcessor' if the contract was never deployed or if the code changed since last deployment
  await deploy('Restore', {
    from: deployer,
    // gas: 4000000,
    args: [PROXY_REGISTRATION_ADDRESS],
  });

  console.log('deployed Restore');
};
export default func;