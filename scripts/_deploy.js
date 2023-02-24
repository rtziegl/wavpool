const { ethers } = require('hardhat');
const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const compFactory = await hre.ethers.getContractFactory("Competition");
    const compContract = await compFactory.deploy();
    await compContract.deployed();

    console.log("Contract deployed to:", compContract.address);
    console.log("Contract deployed by:", owner.address);
};

const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();