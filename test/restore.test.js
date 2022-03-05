const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Restore", function () {
  beforeEach(async function () {
    const Restore = await ethers.getContractFactory("Restore");
    const [deployer, alice] = await ethers.getSigners();
    this.deployer = deployer;
    this.alice = alice;
    this.Restore = await Restore.deploy();
  });

  describe("ERC721", function () {
    it("has correct name and symbol", async function () {
      expect(await this.Restore.name()).to.equal("Restore");
      expect(await this.Restore.symbol()).to.equal("REST");
    });

    describe("minting", function () {
      it("the owner can mint", async function () {
        await this.Restore.safeMint(this.deployer.address, "arweaveUrl");
        expect(await this.Restore.balanceOf(this.deployer.address)).to.equal(1);
        await this.Restore.safeMint(this.deployer.address, "arweaveUrl");
        expect(await this.Restore.balanceOf(this.deployer.address)).to.equal(2);
      });
      it("no-one else can mint", async function () {
        await expect(this.Restore.connect(this.alice).safeMint(this.deployer.address, "arweaveUrl"))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("the uri associated with the NFT should be what we pass in", async function () {
        await this.Restore.safeMint(this.deployer.address, "testxhdiwyannfof86mdjeifh1");
        expect (await this.Restore.tokenURI(0)).to.equal("testxhdiwyannfof86mdjeifh1");
      })
    });

    describe("burning", function () {
      it("should let signers burn their own NFTs", async function () {
        await this.Restore.safeMint(this.deployer.address, "arweaveUrl");
        await this.Restore.connect(this.deployer).burn(0);
        expect(await this.Restore.balanceOf(this.deployer.address)).to.equal(0);
      })
      it("should not let anyone other than signer burn an NFT", async function () {
        await this.Restore.safeMint(this.deployer.address, "arweaveUrl");
        await expect(this.Restore.connect(this.alice).burn(0))
          .to.be.revertedWith("ERC721Burnable: caller is not owner nor approved");
      })
    })
    
  });

});
