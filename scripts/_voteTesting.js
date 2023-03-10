const { ethers } = require('hardhat');
const { TASK_COMPILE_SOLIDITY_LOG_NOTHING_TO_COMPILE } = require('hardhat/builtin-tasks/task-names');
const main = async () => {
    const [owner, randomPerson, randomPerson1, randomPerson2] = await hre.ethers.getSigners();
    const metadata = "https://opensea-creatures-api.herokuapp.com/api/creature/1"

    const compFactory = await hre.ethers.getContractFactory("Competition");
    const compContract = await compFactory.deploy();
    await compContract.deployed();

    console.log(await compContract.connect(randomPerson).checkIfOwner())
    console.log(await compContract.checkIfOwner())

    /*const mintFactory = await hre.ethers.getContractFactory("Minter");
    const mintContract = await mintFactory.deploy();
    await mintContract.deployed();*/

    console.log("Contract deployed by:", owner.address);
    await compContract.startCompetition(51, hre.ethers.utils.parseEther('0.01') , "Beat");
    console.log(await compContract.getCompetitionStats(0))
    var buyTXoptions = { value: hre.ethers.utils.parseEther('0.01') }

    // RandomPerson's buyin.
    await compContract.connect(randomPerson).buyin(buyTXoptions)
    await compContract.connect(randomPerson1).buyin(buyTXoptions)
    await compContract.connect(randomPerson2).buyin(buyTXoptions)

    // Voting.
    await compContract.connect(randomPerson).vote(randomPerson1.address)
    await compContract.connect(randomPerson1).vote(randomPerson.address)
    await compContract.connect(randomPerson2).vote(randomPerson1.address)

    console.log(await compContract.getCompetitionStats(0))
    await await compContract.endCompetition()
    console.log(await compContract.getCompetitionStats(0))
    
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