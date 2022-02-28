const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    //create and deploy market contract
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    //create and deploy nft contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAdress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    //create 2 nfts
    await nft.createToken("https://www.mytokenlcoation.com");
    await nft.createToken("https://www.mytokenlcoation2.com");

    //list nfts
    await market.createMarketItem(nftContractAdress, 1, auctionPrice, { value: listingPrice });
    await market.createMarketItem(nftContractAdress, 2, auctionPrice, { value: listingPrice });

    //get dummy addresses
    const [_, buyerAddress] = await ethers.getSigners();

    //buy nft
    await market.connect(buyerAddress).createMarketSale(nftContractAdress, 1, { value: auctionPrice });

    let items = await market.fetchMarketItems();

    items = await Promise.all(items.map(async i => {
      const tokenURI = await nft.tokenURI(i.tokenId);
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenURI
      }

      return item;
    }))

    console.log('items: ', items);
  });
});
