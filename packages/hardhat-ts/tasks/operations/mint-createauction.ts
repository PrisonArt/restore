import { task, types } from "hardhat/config";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { Restore, Justice } from "../../typechain";
import { TASK_MINT_CREATEAUCTION } from "../task-names";
// hh mint-createauction --network localhost|rinkeby|mainnet --creator-addr 0x911753aB62fFd27B78C6db07685DBf0089634eb4 --metadata-uri ar://8_NZWr4K9d6N8k4TDbMzLAkW6cNQnSQMLeoShc8komM --split 70,20,10
task(TASK_MINT_CREATEAUCTION, "Mints a token with token metadata uri, then creates an auction with the token")
  .addParam("creatorAddr", "The artist address if available or pr1son art payment address", null, types.string)
  .addParam("metadataUri", "The token URI", null, types.string)
  .addParam("split", "Array of percentages to split the income", "70,20,10", types.string)
  .setAction(async ({ creatorAddr, metadataUri, split }, hre) => {

    if (!creatorAddr) {
      console.log('Creator Address is required');
      process.exit(0)
    }
    console.log('creatorAddr:', creatorAddr)

    if (!metadataUri.startsWith("ar://")) {
      console.log('token-id must begin with ar://');
      process.exit(0)
    }
    console.log('mintTokenURI:', metadataUri)

    const { deployments, ethers } = hre;

    const [ deployer ] = await ethers.getSigners();
    console.log(`deployer address: ${deployer.address}`);

    const network = await hre.ethers.provider.getNetwork();
    console.log(`network: ${network.name}`);

    const restoreDeployment = await deployments.get("Restore");
    console.log(`restore contract address: ${restoreDeployment.address}`);

    const justiceDeployment = await deployments.get("Justice");
    console.log(`justice contract address: ${justiceDeployment.address}`);

    const restoreContract: Restore = new hre.ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;
    const justiceContract: Justice = new hre.ethers.Contract(justiceDeployment.address, justiceDeployment.abi, deployer) as Justice;

    const mintTx: ContractTransaction = await restoreContract.connect(deployer)
      .mintForAuction(deployer.address, metadataUri, { gasLimit: 300000 });

    const mintReceipt: ContractReceipt = await mintTx.wait();
    console.log('minted:', mintReceipt);

    let tokenId = 0;
    mintReceipt.events!.forEach(event => {
      if (event.event === 'ReadyForAuction') {
        console.log('ReadyForAuction:', event.args!['tokenId']);
        tokenId = event.args!['tokenId'];
      }
    });

    if (tokenId) {
      console.log('creating auction for tokenId:', tokenId);
      const splitArray = split.split(',').map((string: any) => BigNumber.from(string));
      console.log('with splits:', splitArray);

      const createAuctionTx: ContractTransaction = await justiceContract.connect(deployer).createAuction(creatorAddr, tokenId, splitArray);
      const createAuctionReceipt: ContractReceipt = await createAuctionTx.wait();
      console.log('auction created:', createAuctionReceipt);
    }

    process.exit(0)
  });