import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import {
  MaliciousBidder__factory as MaliciousBidderFactory,
  Justice,
  Restore,
  WETH,
} from '../typechain';
import { deployRestore, deployWeth } from './utils';

chai.use(solidity);
const { expect } = chai;

describe('Justice', () => {
  let justice: Justice;
  let restore: Restore;
  let weth: WETH;
  let deployer: SignerWithAddress;
  let pr1s0nart: SignerWithAddress;
  let payment: SignerWithAddress;
  let fund: SignerWithAddress;
  let bidderA: SignerWithAddress;
  let bidderB: SignerWithAddress;
  let snapshotId: number;

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  async function deployJustice() {
    const justiceFactory = await ethers.getContractFactory('Justice', deployer);
    return justiceFactory.deploy(
      restore.address,
      weth.address,
      payment.address,
      fund.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION) as Promise<Justice>;
  }

  before(async () => {
    [deployer, pr1s0nart, payment, fund, bidderA, bidderB] = await ethers.getSigners();
    restore = await deployRestore(deployer);
    weth = await deployWeth(deployer);
    justice = await deployJustice();
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  describe('auction', function () {
    it('should allow pr1s0nart to create an auction', async () => {
      const tokenURI = 'https://eth.iwahi.com/1df0';
      await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);
      const tokenBalance = await restore.balanceOf(restore.address);
      const tokenId = tokenBalance.toNumber() - 1;

      const paymentSplit = ethers.BigNumber.from(70);
      const fundSplit = ethers.BigNumber.from(10);
      const creatorSplit = ethers.BigNumber.from(20);

      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [paymentSplit, fundSplit, creatorSplit]);

      const auction = await justice.auction();
      
      expect(auction.creator).to.be.equal(pr1s0nart.address);
      expect(auction.tokenId.toNumber()).to.be.equal(0);
      expect(auction.amount.toNumber()).to.be.equal(0);
      expect(auction.startTime.toNumber()).to.be.greaterThan(0);

      const endCalc = auction.startTime.toNumber() + DURATION;

      expect(auction.endTime.toNumber()).to.be.equal(endCalc);
      expect(auction.bidder).to.be.equal(ZERO_ADDRESS);
      expect(auction.settled).to.be.false;

      // TODO: figure out what is going on with the split array and how to set and access it properly here.
      // console.log(auction);
    });
    // TODO: Contract should not create an Auction for token ids that are bigger than the token balance
  //   it('can\'t create an auction for a non-existant token', async () => {
  //     const tokenBalance = await restore.balanceOf(restore.address);
  //     console.log('tokenBalance: ', tokenBalance);
  //     const tokenId = 100;

  //     const paymentSplit = ethers.BigNumber.from(70);
  //     const fundSplit = ethers.BigNumber.from(10);
  //     const creatorSplit = ethers.BigNumber.from(20);

  //     await expect(
  //       justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [paymentSplit, fundSplit, creatorSplit])
  //     ).to.be.revertedWith('Token does not exist');

  //   });
  // });
  describe('bidding', function () {
    it('should revert if a user creates a bid for an inactive auction', async () => {
      const tokenId = ethers.BigNumber.from(0);
      
      const tx = justice.connect(bidderA).createBid(tokenId.add(1), {
        value: RESERVE_PRICE,
      });

      await expect(tx).to.be.revertedWith('Justice: Art not up for auction');
    });

    it('should revert if a user creates a bid for an expired auction', async () => {
      const tokenId = ethers.BigNumber.from(0);

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

      const tx = justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      await expect(tx).to.be.revertedWith('Justice: Auction expired');
    });

    it('should revert if a user creates a bid with an amount below the reserve price', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      const tx = justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE - 1,
      });

      await expect(tx).to.be.revertedWith('Justice: Must send at least reservePrice');
    });

    it('should revert if a user creates a bid less than the min bid increment percentage', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE * 50,
      });
      const tx = justice.connect(bidderB).createBid(tokenId, {
        value: RESERVE_PRICE * 51,
      });

      await expect(tx).to.be.revertedWith(
        'Justice: Must send more than last bid by minBidIncrementPercentage amount',
      );
    });

    it('should refund the previous bidder when the following user creates a bid', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      const bidderAPostBidBalance = await bidderA.getBalance();
      await justice.connect(bidderB).createBid(tokenId, {
        value: RESERVE_PRICE * 2,
      });
      const bidderAPostRefundBalance = await bidderA.getBalance();

      expect(bidderAPostRefundBalance).to.equal(bidderAPostBidBalance.add(RESERVE_PRICE));
    });

    it('should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WETH', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      const maliciousBidderFactory = new MaliciousBidderFactory(bidderA);
      const maliciousBidder = await maliciousBidderFactory.deploy();

      const maliciousBid = await maliciousBidder
        .connect(bidderA)
        .bid(justice.address, tokenId, {
          value: RESERVE_PRICE,
        });
      await maliciousBid.wait();

      const tx = await justice.connect(bidderB).createBid(tokenId, {
        value: RESERVE_PRICE * 2,
        gasLimit: 1_000_000,
      });
      const result = await tx.wait();

      expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
      expect(await weth.balanceOf(maliciousBidder.address)).to.equal(RESERVE_PRICE);
    });

    it('should emit an `AuctionBid` event on a successful bid', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      const tx = justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      await expect(tx)
        .to.emit(justice, 'AuctionBid')
        .withArgs(tokenId, bidderA.address, RESERVE_PRICE, false);
    });
  });
  describe('extend auction', function () {
    it('should emit an `AuctionExtended` event if the auction end time is within the time buffer', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      const auction = await justice.auction();

      await ethers.provider.send('evm_setNextBlockTimestamp', [auction.endTime.sub(60 * 5).toNumber()]); // Subtract 5 mins from current end time

      const tx = justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      await expect(tx)
        .to.emit(justice, 'AuctionExtended')
        .withArgs(tokenId, auction.endTime.add(60 * 10));
    });
  });
  describe('settle auction', function () {
    it('should revert if auction settlement is attempted while the auction is still active', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });
      const tx = justice.connect(bidderA).settleAuction();

      await expect(tx).to.be.revertedWith('Auction hasn\'t completed');
    });

    it('should emit `AuctionSettled` and `AuctionCreated` events if all conditions are met', async () => {
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      const setJusticeTx = await restore.connect(deployer).setJustice(justice.address);
      const setJusticeReceipt = await setJusticeTx.wait();

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours
      const tx = await justice.connect(deployer).settleAuction();

      const receipt = await tx.wait();

      const settledEvent = receipt.events?.find(e => e.event === 'AuctionSettled');

      expect(settledEvent?.args?.tokenId).to.equal(tokenId);
      expect(settledEvent?.args?.winner).to.equal(bidderA.address);
      expect(settledEvent?.args?.amount).to.equal(RESERVE_PRICE);
    });

    it('should not allow anyone other than the owner to settle an auction', async () => {
      // TODO: could just protect this route with onlyOwner to save people who try to call it some gas?
      const tokenId = ethers.BigNumber.from(0);
      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours
      await expect(
        justice.connect(bidderA).settleAuction()
      ).to.be.revertedWith('Restore: auctioned piece must be frozen by owner via Justice');
    })
  });
  describe('transfer art', function () {
    it('should return the art to pr1s0nart on auction settlement if no bids are received', async () => {
      const tokenURI = 'https://eth.iwahi.com/2df0';
      await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);
      const tokenBalance = await restore.balanceOf(restore.address);
      const tokenId = tokenBalance.toNumber() - 1;

      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      const setJusticeTx = await restore.connect(deployer).setJustice(justice.address);
      const setJusticeReceipt = await setJusticeTx.wait();

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

      const tx = await justice.connect(deployer).settleAuction();

      const receipt = await tx.wait();

      const settledEvent = receipt.events?.find(e => e.event === 'AuctionSettled');

      expect(settledEvent?.args?.tokenId).to.equal(tokenId);
      expect(settledEvent?.args?.winner).to.equal(ZERO_ADDRESS);
      expect(settledEvent?.args?.amount).to.equal(0);

      expect(await restore.balanceOf(deployer.address)).to.equal(1);
      expect(await restore.ownerOf(tokenId)).to.equal(deployer.address);
      expect(await restore.tokenURI(tokenId)).to.equal(tokenURI); 
    });

    it('e2e: should transfer the art to the buyer after auction setllement, when pr1s0nart attaches receipt of payment', async() => {
      const tokenURI = 'https://eth.iwahi.com/3df0';

      await restore.connect(deployer).mintForAuction(deployer.address, tokenURI);
      const tokenBalance = await restore.balanceOf(restore.address);
      const tokenId = tokenBalance.toNumber() - 1;

      const setJusticeTx = await restore.connect(deployer).setJustice(justice.address);
      const setJusticeReceipt = await setJusticeTx.wait();

      await justice.connect(deployer).createAuction(pr1s0nart.address, tokenId, [70, 10, 20]);

      await justice.connect(bidderA).createBid(tokenId, {
        value: RESERVE_PRICE,
      });

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

      await justice.connect(deployer).settleAuction();

      const text = 'LFO paid in full';
      const data = ethers.utils.formatBytes32String(text);

      await expect(
        restore.connect(deployer).transferToBuyer(tokenId, data)
      ).to.emit(restore, 'ArtTransferred')
      .withArgs(bidderA.address, tokenId, data);

      expect(await restore.balanceOf(bidderA.address)).to.equal(1);
      expect(await restore.ownerOf(tokenId)).to.equal(bidderA.address);
      expect(await restore.tokenURI(tokenId)).to.equal(tokenURI); 
    });
  });
});