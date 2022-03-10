import { ethers } from "hardhat";
import chai from "chai";
import { Restore__factory, Restore } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { int } from "hardhat/internal/core/params/argumentTypes";

const { expect } = chai;

let restore: Restore;
let restoreFactory: Restore__factory;
let deployer: SignerWithAddress;
let alice: SignerWithAddress;
let payment: SignerWithAddress;

const PROXY_REGISTRATION_ADDRESS = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Restore", function () {
  beforeEach(async function () {
    [deployer, alice, payment] = await ethers.getSigners();
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

  describe("royalties", async() => {
    const tokenURI = "https://eth.iwahi.com/1df0";
    const salePrice = ethers.BigNumber.from(100);
    const royalty = ethers.BigNumber.from(1000); // 10% with the two decimals places the contract is expecting
    const excessRoyalty = ethers.BigNumber.from(10001); // 100.01%
    const newRoyalty = ethers.BigNumber.from(500); // 5% with the two decimals places the contract is expecting

    it('has no royalties if not set', async function () {
        await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);

        const info = await restore.royaltyInfo(0, salePrice);
        expect(info[1].toNumber()).to.be.equal(0);
        expect(info[0]).to.be.equal(ZERO_ADDRESS);
    });

    it('throws if royalties more than 100%', async function () {
        const tx = restore.connect(deployer).setRoyalties(
            payment.address,
            excessRoyalty,
        );
        await expect(tx).to.be.revertedWith('ERC2981Royalties: Too high');
    });

    it('has the right royalties for tokenId', async function () {
        await restore.connect(deployer).setRoyalties(
            payment.address,
            royalty,
        );

        await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);

        const info = await restore.royaltyInfo(1, salePrice);
        // We expect the royaltAmount to come back as the salePrice * royalty / 10000
        expect(info[1].toNumber()).to.be.equal(10);
        expect(info[0]).to.be.equal(payment.address);
    });

    it("throws if someone other than the owner tries to set royalties", async() => {
      await expect(
        restore.connect(alice).setRoyalties(payment.address, royalty)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('can set address(0) as royalties recipient', async function () {
        await restore.connect(deployer).setRoyalties(ZERO_ADDRESS, newRoyalty);

        await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);

        const info = await restore.royaltyInfo(2, salePrice);
        expect(info[1].toNumber()).to.be.equal(5);
        expect(info[0]).to.be.equal(ZERO_ADDRESS);
    });
  })

  describe("transferToBuyer", async () => {
    it("should let the owner transfer sold tokens to the buyer", async () => {
      // I would like to figure out if we can actually freeze transfers first before writing these tests.

    })
  })

});
