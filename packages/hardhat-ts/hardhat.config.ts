import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig, HttpNetworkHDAccountsConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-solhint";
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import "solidity-coverage";
import "hardhat-deploy";
import 'hardhat-deploy-ethers';

import './tasks/operations/accounts';

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const MAINNET_PRIVATE_KEY =
    process.env.MAINNET_PRIVATE_KEY ||
    "";
const RINKEBY_PRIVATE_KEY =
    process.env.RINKEBY_PRIVATE_KEY ||
    "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const MNEMONIC = process.env.MNEMONIC;

const accounts: HttpNetworkHDAccountsConfig = {
    mnemonic: MNEMONIC || "test test test test test test test test test test test junk",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 10,
    passphrase: ""
};

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.11", settings: {} }],
    },
    paths: {
        sources: 'contracts',
    },
    namedAccounts: {
        deployer: 0,
        tokenOwner: 1,
    },
    networks: {
        hardhat: {
            chainId: 1337,
            mining: {
              auto: true,
              interval: 10000
            },
            allowUnlimitedContractSize: true,
            initialBaseFeePerGas: 0, //https://github.com/sc-forks/solidity-coverage/issues/652
        },
        localhost: {
            url: "http://localhost:8545",
            accounts: accounts,
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
            accounts: [RINKEBY_PRIVATE_KEY],
        },
        mainnet: {
        url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
        accounts: [MAINNET_PRIVATE_KEY],
        }
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false,
        currency: "USD",
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
    }
};

export default config;