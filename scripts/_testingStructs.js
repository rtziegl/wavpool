const { ethers } = require('hardhat');
const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const metadata = "https://opensea-creatures-api.herokuapp.com/api/creature/1"

    const compFactory = await hre.ethers.getContractFactory("Competition");
    const compContract = await compFactory.deploy();
    await compContract.deployed();

    /*const mintFactory = await hre.ethers.getContractFactory("Minter");
    const mintContract = await mintFactory.deploy();
    await mintContract.deployed();*/

    console.log("Contract deployed by:", owner.address);

    console.log(await compContract.returnMap())
    var buyTXoptions = { value: hre.ethers.utils.parseEther('0.01') }
    var btx = hre.ethers.utils.parseEther('0.01') 
    await compContract.startCompetition(50, btx)
    await compContract.buyin(buyTXoptions)
    await compContract.connect(randomPerson).buyin(buyTXoptions)
    console.log(await compContract.getAllFromCompetition())
    console.log(await compContract.getSpotsRemaining())
    console.log(await compContract.returnMap())

    await compContract.startCompetition(50, btx)
    await compContract.buyin(buyTXoptions)
    await compContract.connect(randomPerson).buyin(buyTXoptions)
    console.log(await compContract.getAllFromCompetition())
    console.log(await compContract.getSpotsRemaining())
    console.log(await compContract.returnMap())

    // Minting the token
    const transaction= await compContract.mintNFT(
        metadata,
        {
          gasLimit: 500_000,
        },
      )
    const tx = await transaction.wait() 

    const transaction2= await compContract.mintNFT(
      metadata,
      {
        gasLimit: 500_000,
      },
    )
  const tx2 = await transaction.wait() 
    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber(); // Getting the tokenID
    const tokenURI = await compContract.tokenURI(tokenId) // Using the tokenURI from ERC721 to retrieve de metadata
    console.log(tokenId)
    console.log(tokenURI)
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