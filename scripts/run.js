const { ethers } = require('hardhat');
const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const careerFairFactory = await hre.ethers.getContractFactory("Competition");
    const careerFairContract = await careerFairFactory.deploy();
    await careerFairContract.deployed();

    console.log("Contract deployed to:", careerFairContract.address);
    console.log("Contract deployed by:", owner.address);
    console.log(randomPerson.address);


    var buyTXoptions = { value: hre.ethers.utils.parseEther('0.01') }
    await careerFairContract.buyin(buyTXoptions)
    await careerFairContract.connect(randomPerson).buyin(buyTXoptions)
    console.log(await careerFairContract.getAllFromCompetition())
    console.log(await careerFairContract.getSpotsRemaining())
    console.log(await careerFairContract.getBalanceOfContract())
    await careerFairContract.connect(randomPerson).resetCompetition()
    console.log(await careerFairContract.getAllFromCompetition())
    console.log(await careerFairContract.getSpotsRemaining())
    

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