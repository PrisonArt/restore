import { ethers } from "hardhat";
import chai from "chai";
import { Restore } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { deployRestore } from './utils';

const { expect } = chai;

let restore: Restore;
let deployer: SignerWithAddress;
let other: SignerWithAddress;
let payment: SignerWithAddress;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const TIME_BUFFER = 15 * 60;
const RESERVE_PRICE = 2;
const MIN_INCREMENT_BID_PERCENTAGE = 5;
const DURATION = 60 * 60 * 24;

describe("Restore", function () {
  beforeEach(async function () {
    [deployer,,payment,,,,other, ] = await ethers.getSigners();
    restore = await deployRestore(deployer);
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

      expect(await restore.balanceOf(restore.address)).to.equal(1);
      expect(await restore.ownerOf(tokenId)).to.equal(restore.address);
      expect(await restore.tokenURI(tokenId)).to.equal(tokenURI);   
    });

    it("other accounts cannot mint tokens", async () => {
      const tokenURI = "https://eth.iwahi.com/2d3a";
      await expect(
        restore.connect(other).mintForAuction(other.address, tokenURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("no-one, including the owner, can freeze a token, except through another contract", async() => {
      const tokenId = ethers.BigNumber.from(0);
      const tokenURI = "https://eth.iwahi.com/1df0";

      await expect(restore.connect(deployer).mintForAuction(deployer.address, tokenURI))
        .to.emit(restore, "ReadyForAuction")
        .withArgs(tokenId, tokenURI);

      await expect(
        restore.connect(deployer).freeze(deployer.address, tokenId)
      ).to.be.revertedWith("Restore: auctioned piece must be frozen by owner via Justice")
    })
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
        restore.connect(other).setRoyalties(payment.address, royalty)
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

});
