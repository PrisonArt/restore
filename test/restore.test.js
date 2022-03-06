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
  });

});
