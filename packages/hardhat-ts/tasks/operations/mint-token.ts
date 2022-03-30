import { task, types } from "hardhat/config";
import { ContractTransaction } from "ethers";
import { Restore } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { TASK_MINT } from "../task-names";
// hh mint-token --network locoalhost|rinkeby|mainnet --creator-addr 0x911753aB62fFd27B78C6db07685DBf0089634eb4 --metadata-uri ar://8_NZWr4K9d6N8k4TDbMzLAkW6cNQnSQMLeoShc8komM
task(TASK_MINT, "Mints a token with token metadata uri")
  .addParam("creatorAddr", "The artist address if available or pr1son art payment address", null, types.string)
  .addParam("metadataUri", "The token URI", null, types.string)
  .setAction(async ({ creatorAddr, metadataUri }, hre) => {

    if (!creatorAddr) {
      console.log('Creator Address is required');
      process.exit(0)
    }
    console.log('creatorAddr:', metadataUri)

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
    console.log(`contractAddress: ${restoreDeployment.address}`);

    const contract: Restore = new hre.ethers.Contract(restoreDeployment.address, restoreDeployment.abi, deployer) as Restore;

    const receipt: ContractTransaction = await contract.connect(deployer)
      .mintForAuction(creatorAddr, metadataUri, { gasLimit: 300000 });

    console.log('minted:', receipt);
    process.exit(0)
  });