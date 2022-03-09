import { ethers } from "hardhat";
import chai from "chai";
import { Restore__factory, Restore } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { expect } = chai;

let restore: Restore;
let restoreFactory: Restore__factory;
let deployer: SignerWithAddress;
let alice: SignerWithAddress;

const PROXY_REGISTRATION_ADDRESS = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Restore", function () {
  beforeEach(async function () {
    [deployer, alice] = await ethers.getSigners();
    restoreFactory = (await ethers.getContractFactory(
        'Restore',
        deployer
    )) as Restore__factory;

    restore = (await restoreFactory.deploy(PROXY_REGISTRATION_ADDRESS)) as Restore;
    expect(restore.address).to.properAddress;
  });

  describe("ERC721", function () {
    it("has correct name and symbol", async function () {
      expect(await restore.name()).to.equal("Restore");
      expect(await restore.symbol()).to.equal("REST");
    });    
  });

  describe("minting", async () => {
    it("contract owner can mint tokens", async () => {
      const tokenId = ethers.BigNumber.from(0);
      const tokenURI = "https://eth.iwahi.com/1df0";

      await expect(restore.connect(deployer).mintForAuction(deployer.address, tokenURI))
        .to.emit(restore, "ReadyForAuction")
        .withArgs(tokenId, tokenURI);

      expect(await restore.balanceOf(deployer.address)).to.equal(1);
      expect(await restore.ownerOf(tokenId)).to.equal(deployer.address);
      expect(await restore.tokenURI(tokenId)).to.equal(tokenURI);

      await expect(restore.connect(deployer).freeze(alice.address, tokenId))
        .to.emit(restore, "ArtFrozen")
        .withArgs(alice.address, tokenId);

      const text = "Hello Alice!";

      const data = ethers.utils.formatBytes32String(text);

      await expect(restore.connect(deployer).transferToBuyer(tokenId, data))
        .to.emit(restore, "ArtTransferred")
        .withArgs(tokenId, data);

      //TODO: view log data from transaction to see if Hello Alice is there

    });

    it("other accounts cannot mint tokens", async () => {
      const tokenURI = "https://eth.iwahi.com/2d3a";
      await expect(
        restore.connect(alice).mintForAuction(alice.address, tokenURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

});
