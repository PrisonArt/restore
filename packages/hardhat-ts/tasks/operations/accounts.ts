import { task } from 'hardhat/config';

import { TASK_ACCOUNTS } from '../task-names';

task(TASK_ACCOUNTS, 'Prints the list of accounts', async (_taskArgs, hre) => {
  const { getNamedAccounts } = hre;

  const accounts = await getNamedAccounts();

  for (const name in accounts) {
    console.log(name, accounts[name]);
  }
});
